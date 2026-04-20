import { sql } from '@/lib/db';
import { LeaveRequestInput, ApproveLeaveInput } from '@/lib/schemas';
import { queueNotification } from '@/lib/notifications';

export async function createLeaveRequest(
  employeeId: number,
  tenantId: number,
  input: LeaveRequestInput
) {
  try {
    const { leaveTypeId, startDate, endDate, reason } = input;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      throw new Error('End date must be after start date');
    }

    // Check for overlapping leave requests
    const overlapping = await sql`
      SELECT id FROM leave_requests
      WHERE employee_id = ${employeeId}
        AND tenant_id = ${tenantId}
        AND status IN ('pending', 'approved')
        AND start_date <= ${endDate}
        AND end_date >= ${startDate}
    `;

    if (overlapping.length > 0) {
      throw new Error('Overlapping leave request already exists');
    }

    // Create leave request
    const result = await sql`
      INSERT INTO leave_requests (
        tenant_id, employee_id, leave_type_id, start_date, end_date, reason, status
      )
      VALUES (${tenantId}, ${employeeId}, ${leaveTypeId}, ${startDate}, ${endDate}, ${reason}, 'pending')
      RETURNING id, start_date, end_date, status, created_at
    `;

    return result[0];
  } catch (error) {
    throw new Error(
      `Failed to create leave request: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function approveLeaveRequest(
  approverId: number,
  tenantId: number,
  input: ApproveLeaveInput
) {
  try {
    const { leaveRequestId, approved, rejectionReason } = input;

    // Fetch leave request details for notification
    const leaveRequestDetails = await sql`
      SELECT lr.id, lr.employee_id, lr.start_date, lr.end_date, lr.reason,
             u.email as employee_email, u.first_name, u.last_name,
             lt.name as leave_type
      FROM leave_requests lr
      JOIN users u ON lr.employee_id = u.id
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      WHERE lr.id = ${leaveRequestId} AND lr.tenant_id = ${tenantId}
    `;

    if (leaveRequestDetails.length === 0) {
      throw new Error('Leave request not found');
    }

    const leaveDetails = leaveRequestDetails[0];

    if (approved) {
      // Approve the request
      const result = await sql`
        UPDATE leave_requests
        SET status = 'approved', approver_id = ${approverId}, approved_at = NOW()
        WHERE id = ${leaveRequestId} AND tenant_id = ${tenantId}
        RETURNING id, status, approved_at
      `;

      // Queue notification
      await queueNotification({
        event: 'leave-approved',
        userId: leaveDetails.employee_id,
        tenantId,
        data: {
          leaveRequestId,
          employeeEmail: leaveDetails.employee_email,
          firstName: leaveDetails.first_name,
          lastName: leaveDetails.last_name,
          leaveType: leaveDetails.leave_type,
          startDate: leaveDetails.start_date,
          endDate: leaveDetails.end_date,
        },
      });

      return result[0];
    } else {
      // Reject the request
      const result = await sql`
        UPDATE leave_requests
        SET status = 'rejected', approver_id = ${approverId}, reason = ${rejectionReason || ''}
        WHERE id = ${leaveRequestId} AND tenant_id = ${tenantId}
        RETURNING id, status
      `;

      // Queue notification
      await queueNotification({
        event: 'leave-rejected',
        userId: leaveDetails.employee_id,
        tenantId,
        data: {
          leaveRequestId,
          employeeEmail: leaveDetails.employee_email,
          firstName: leaveDetails.first_name,
          lastName: leaveDetails.last_name,
          leaveType: leaveDetails.leave_type,
          startDate: leaveDetails.start_date,
          endDate: leaveDetails.end_date,
          rejectionReason: rejectionReason || 'Request was not approved',
        },
      });

      return result[0];
    }
  } catch (error) {
    throw new Error(
      `Failed to update leave request: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function getLeaveRequests(tenantId: number, filters?: { status?: string; employeeId?: number }) {
  try {
    let query = sql`
      SELECT
        lr.id, lr.employee_id, lr.start_date, lr.end_date, lr.reason, lr.status,
        lr.approver_id, lr.approved_at, lr.created_at,
        u.first_name, u.last_name, u.email, lt.name as leave_type
      FROM leave_requests lr
      JOIN users u ON lr.employee_id = u.id
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      WHERE lr.tenant_id = ${tenantId}
    `;

    if (filters?.status) {
      query = sql`
        SELECT
          lr.id, lr.employee_id, lr.start_date, lr.end_date, lr.reason, lr.status,
          lr.approver_id, lr.approved_at, lr.created_at,
          u.first_name, u.last_name, u.email, lt.name as leave_type
        FROM leave_requests lr
        JOIN users u ON lr.employee_id = u.id
        JOIN leave_types lt ON lr.leave_type_id = lt.id
        WHERE lr.tenant_id = ${tenantId} AND lr.status = ${filters.status}
      `;
    }

    if (filters?.employeeId) {
      query = sql`
        SELECT
          lr.id, lr.employee_id, lr.start_date, lr.end_date, lr.reason, lr.status,
          lr.approver_id, lr.approved_at, lr.created_at,
          u.first_name, u.last_name, u.email, lt.name as leave_type
        FROM leave_requests lr
        JOIN users u ON lr.employee_id = u.id
        JOIN leave_types lt ON lr.leave_type_id = lt.id
        WHERE lr.tenant_id = ${tenantId} AND lr.employee_id = ${filters.employeeId}
      `;
    }

    const results = await query;
    return results;
  } catch (error) {
    throw new Error(
      `Failed to fetch leave requests: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function createLeaveType(tenantId: number, name: string, daysPerYear: number, carryForward: number = 0) {
  try {
    const result = await sql`
      INSERT INTO leave_types (tenant_id, name, days_per_year, carry_forward)
      VALUES (${tenantId}, ${name}, ${daysPerYear}, ${carryForward})
      RETURNING id, name, days_per_year, carry_forward
    `;

    return result[0];
  } catch (error) {
    throw new Error(
      `Failed to create leave type: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

const defaultLeaveTypes = [
  { name: 'Vacation', days_per_year: 20, carry_forward: 5 },
  { name: 'Sick Leave', days_per_year: 12, carry_forward: 0 },
  { name: 'Personal Leave', days_per_year: 5, carry_forward: 0 },
  { name: 'Maternity Leave', days_per_year: 90, carry_forward: 0 },
  { name: 'Paternity Leave', days_per_year: 14, carry_forward: 0 },
];

export async function getLeaveTypes(tenantId: number) {
  try {
    let results = await sql`
      SELECT id, name, days_per_year, carry_forward
      FROM leave_types
      WHERE tenant_id = ${tenantId}
    `;

    if (results.length === 0) {
      for (const leaveType of defaultLeaveTypes) {
        await sql`
          INSERT INTO leave_types (tenant_id, name, days_per_year, carry_forward)
          VALUES (${tenantId}, ${leaveType.name}, ${leaveType.days_per_year}, ${leaveType.carry_forward})
        `;
      }

      results = await sql`
        SELECT id, name, days_per_year, carry_forward
        FROM leave_types
        WHERE tenant_id = ${tenantId}
      `;
    }

    return results;
  } catch (error) {
    throw new Error(`Failed to fetch leave types: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
