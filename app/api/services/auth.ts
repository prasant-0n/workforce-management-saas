import { sql } from '@/lib/db';
import { hashPassword, comparePassword, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { RegisterInput, LoginInput } from '@/lib/schemas';

export async function registerUser(input: RegisterInput) {
  try {
    const { tenantName, email, password, firstName, lastName } = input;

    // Check if tenant already exists
    const existingTenant = await sql`
      SELECT id FROM tenants WHERE name = ${tenantName}
    `;

    if (existingTenant.length > 0) {
      throw new Error('Tenant name already exists');
    }

    // Create tenant
    const tenantResult = await sql`
      INSERT INTO tenants (name, email, subscription_tier)
      VALUES (${tenantName}, ${email}, 'basic')
      RETURNING id
    `;

    const tenantId = tenantResult[0].id;

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create admin user
    const userResult = await sql`
      INSERT INTO users (tenant_id, email, password_hash, first_name, last_name, role)
      VALUES (${tenantId}, ${email}, ${passwordHash}, ${firstName}, ${lastName}, 'ADMIN')
      RETURNING id, email, role, first_name, last_name
    `;

    const user = userResult[0];

    // Generate tokens
    const accessToken = await generateAccessToken({
      userId: user.id,
      tenantId,
      email: user.email,
      role: user.role,
    });

    const refreshToken = await generateRefreshToken({
      userId: user.id,
      tenantId,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        tenantId,
      },
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw new Error(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function loginUser(input: LoginInput) {
  try {
    const { email, password } = input;

    // Find user
    const users = await sql`
      SELECT u.id, u.password_hash, u.email, u.first_name, u.last_name, u.role, u.tenant_id
      FROM users u
      WHERE u.email = ${email}
    `;

    if (users.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = users[0];

    // Verify password
    const passwordMatch = await comparePassword(password, user.password_hash);

    if (!passwordMatch) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const accessToken = await generateAccessToken({
      userId: user.id,
      tenantId: user.tenant_id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = await generateRefreshToken({
      userId: user.id,
      tenantId: user.tenant_id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        tenantId: user.tenant_id,
      },
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getUserById(userId: number, tenantId: number) {
  try {
    const users = await sql`
      SELECT id, email, first_name, last_name, role, department, status, tenant_id
      FROM users
      WHERE id = ${userId} AND tenant_id = ${tenantId}
    `;

    if (users.length === 0) {
      throw new Error('User not found');
    }

    const user = users[0];
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      department: user.department,
      status: user.status,
      tenantId: user.tenant_id,
    };
  } catch (error) {
    throw new Error(`Failed to fetch user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
