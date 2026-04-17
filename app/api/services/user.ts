import { sql } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { CreateUserInput } from '@/lib/schemas';

export async function createUser(tenantId: number, input: CreateUserInput) {
  try {
    const { email, password, firstName, lastName, role, department } = input;

    // Check if user already exists in tenant
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email} AND tenant_id = ${tenantId}
    `;

    if (existingUsers.length > 0) {
      throw new Error('User already exists in this tenant');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await sql`
      INSERT INTO users (
        tenant_id, email, password_hash, first_name, last_name, role, department
      )
      VALUES (${tenantId}, ${email}, ${passwordHash}, ${firstName}, ${lastName}, ${role}, ${department || null})
      RETURNING id, email, first_name, last_name, role, department, status
    `;

    const user = result[0];
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      department: user.department,
      status: user.status,
    };
  } catch (error) {
    throw new Error(
      `Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function getUsers(tenantId: number, filters?: { role?: string; department?: string; status?: string }) {
  try {
    let query;

    if (filters?.role) {
      query = sql`
        SELECT id, email, first_name, last_name, role, department, status
        FROM users
        WHERE tenant_id = ${tenantId} AND role = ${filters.role}
      `;
    } else if (filters?.department) {
      query = sql`
        SELECT id, email, first_name, last_name, role, department, status
        FROM users
        WHERE tenant_id = ${tenantId} AND department = ${filters.department}
      `;
    } else {
      query = sql`
        SELECT id, email, first_name, last_name, role, department, status
        FROM users
        WHERE tenant_id = ${tenantId}
      `;
    }

    const users = await query;
    return users.map(u => ({
      id: u.id,
      email: u.email,
      firstName: u.first_name,
      lastName: u.last_name,
      role: u.role,
      department: u.department,
      status: u.status,
    }));
  } catch (error) {
    throw new Error(`Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getUserById(userId: number, tenantId: number) {
  try {
    const users = await sql`
      SELECT id, email, first_name, last_name, role, department, status
      FROM users
      WHERE id = ${userId} AND tenant_id = ${tenantId}
    `;

    if (users.length === 0) {
      throw new Error('User not found');
    }

    const u = users[0];
    return {
      id: u.id,
      email: u.email,
      firstName: u.first_name,
      lastName: u.last_name,
      role: u.role,
      department: u.department,
      status: u.status,
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch user: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function getUsersByRole(tenantId: number, role: string) {
  try {
    const users = await sql`
      SELECT id, email, first_name, last_name, role, department, status
      FROM users
      WHERE tenant_id = ${tenantId} AND role = ${role}
    `;

    return users.map(u => ({
      id: u.id,
      email: u.email,
      firstName: u.first_name,
      lastName: u.last_name,
      role: u.role,
      department: u.department,
      status: u.status,
    }));
  } catch (error) {
    throw new Error(
      `Failed to fetch users by role: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function updateUserStatus(tenantId: number, userId: number, status: string) {
  try {
    const result = await sql`
      UPDATE users
      SET status = ${status}
      WHERE id = ${userId} AND tenant_id = ${tenantId}
      RETURNING id, email, status
    `;

    if (result.length === 0) {
      throw new Error('User not found');
    }

    const user = result[0];
    return {
      id: user.id,
      email: user.email,
      status: user.status,
    };
  } catch (error) {
    throw new Error(
      `Failed to update user status: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function updateUserRole(tenantId: number, userId: number, role: string) {
  try {
    const result = await sql`
      UPDATE users
      SET role = ${role}
      WHERE id = ${userId} AND tenant_id = ${tenantId}
      RETURNING id, email, role
    `;

    if (result.length === 0) {
      throw new Error('User not found');
    }

    const user = result[0];
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    throw new Error(
      `Failed to update user role: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function deleteUser(tenantId: number, userId: number) {
  try {
    const result = await sql`
      DELETE FROM users
      WHERE id = ${userId} AND tenant_id = ${tenantId}
      RETURNING id
    `;

    if (result.length === 0) {
      throw new Error('User not found');
    }

    return { id: result[0].id };
  } catch (error) {
    throw new Error(
      `Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
