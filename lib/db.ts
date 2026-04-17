import { neon } from '@neondatabase/serverless';

let sqlInstance: any = null;

function getSql() {
  if (!sqlInstance) {
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    sqlInstance = neon(DATABASE_URL);
  }
  return sqlInstance;
}

// Create a wrapper that works with template literals
export const sql = ((strings: TemplateStringsArray, ...values: any[]) => {
  return getSql()(strings, ...values);
}) as any;

export async function runMigrations() {
  try {
    console.log('Running database migrations...');

    // Tenants Table
    await sql`
      CREATE TABLE IF NOT EXISTS tenants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL,
        subscription_tier VARCHAR(50) DEFAULT 'basic',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Users Table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        tenant_id INT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        role VARCHAR(50) NOT NULL DEFAULT 'employee',
        department VARCHAR(100),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tenant_id, email)
      )
    `;

    // Leave Types
    await sql`
      CREATE TABLE IF NOT EXISTS leave_types (
        id SERIAL PRIMARY KEY,
        tenant_id INT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        days_per_year INT NOT NULL,
        carry_forward INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tenant_id, name)
      )
    `;

    // Leave Requests
    await sql`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id SERIAL PRIMARY KEY,
        tenant_id INT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        employee_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        leave_type_id INT NOT NULL REFERENCES leave_types(id),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        approver_id INT REFERENCES users(id),
        approved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Schedules
    await sql`
      CREATE TABLE IF NOT EXISTS schedules (
        id SERIAL PRIMARY KEY,
        tenant_id INT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        employee_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        shift_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        shift_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tenant_id, employee_id, shift_date)
      )
    `;

    // Audit Logs
    await sql`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        tenant_id INT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id),
        action VARCHAR(255) NOT NULL,
        entity_type VARCHAR(100),
        entity_id INT,
        old_values JSONB,
        new_values JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_leave_requests_tenant_id ON leave_requests(tenant_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_id ON leave_requests(employee_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_schedules_tenant_id ON schedules(tenant_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_schedules_employee_id ON schedules(employee_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_schedules_shift_date ON schedules(shift_date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id)`;

    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }
}
