import { sql } from '@/lib/db';
import { ScheduleInput } from '@/lib/schemas';

export async function createSchedule(tenantId: number, input: ScheduleInput) {
  try {
    const { employeeId, shiftDate, startTime, endTime, shiftType } = input;

    // Validate times
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startTotalMin = startHour * 60 + startMin;
    const endTotalMin = endHour * 60 + endMin;

    if (endTotalMin <= startTotalMin) {
      throw new Error('End time must be after start time');
    }

    // Create schedule
    const result = await sql`
      INSERT INTO schedules (
        tenant_id, employee_id, shift_date, start_time, end_time, shift_type
      )
      VALUES (${tenantId}, ${employeeId}, ${shiftDate}, ${startTime}, ${endTime}, ${shiftType || 'FULL_DAY'})
      RETURNING id, shift_date, start_time, end_time, shift_type
    `;

    return result[0];
  } catch (error) {
    throw new Error(
      `Failed to create schedule: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function updateSchedule(tenantId: number, scheduleId: number, input: ScheduleInput) {
  try {
    const { shiftDate, startTime, endTime, shiftType } = input;

    const result = await sql`
      UPDATE schedules
      SET shift_date = ${shiftDate}, start_time = ${startTime}, end_time = ${endTime}, shift_type = ${shiftType || 'FULL_DAY'}
      WHERE id = ${scheduleId} AND tenant_id = ${tenantId}
      RETURNING id, shift_date, start_time, end_time, shift_type
    `;

    if (result.length === 0) {
      throw new Error('Schedule not found');
    }

    return result[0];
  } catch (error) {
    throw new Error(
      `Failed to update schedule: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function getSchedules(
  tenantId: number,
  filters?: { employeeId?: number; startDate?: string; endDate?: string }
) {
  try {
    let query;

    if (filters?.employeeId) {
      query = sql`
        SELECT
          s.id, s.employee_id, s.shift_date, s.start_time, s.end_time, s.shift_type,
          u.first_name, u.last_name, u.email
        FROM schedules s
        JOIN users u ON s.employee_id = u.id
        WHERE s.tenant_id = ${tenantId} AND s.employee_id = ${filters.employeeId}
      `;
    } else if (filters?.startDate && filters?.endDate) {
      query = sql`
        SELECT
          s.id, s.employee_id, s.shift_date, s.start_time, s.end_time, s.shift_type,
          u.first_name, u.last_name, u.email
        FROM schedules s
        JOIN users u ON s.employee_id = u.id
        WHERE s.tenant_id = ${tenantId}
          AND s.shift_date >= ${filters.startDate}
          AND s.shift_date <= ${filters.endDate}
      `;
    } else {
      query = sql`
        SELECT
          s.id, s.employee_id, s.shift_date, s.start_time, s.end_time, s.shift_type,
          u.first_name, u.last_name, u.email
        FROM schedules s
        JOIN users u ON s.employee_id = u.id
        WHERE s.tenant_id = ${tenantId}
      `;
    }

    const results = await query;
    return results;
  } catch (error) {
    throw new Error(
      `Failed to fetch schedules: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function deleteSchedule(tenantId: number, scheduleId: number) {
  try {
    const result = await sql`
      DELETE FROM schedules
      WHERE id = ${scheduleId} AND tenant_id = ${tenantId}
      RETURNING id
    `;

    if (result.length === 0) {
      throw new Error('Schedule not found');
    }

    return { id: result[0].id };
  } catch (error) {
    throw new Error(
      `Failed to delete schedule: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
