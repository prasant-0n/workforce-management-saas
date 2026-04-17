import { z } from 'zod';

export const registerSchema = z.object({
  tenantName: z.string().min(1, 'Tenant name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE']),
  department: z.string().optional(),
});

export const leaveRequestSchema = z.object({
  leaveTypeId: z.number().positive('Leave type ID must be positive'),
  startDate: z.string().refine(date => !isNaN(Date.parse(date)), 'Invalid start date'),
  endDate: z.string().refine(date => !isNaN(Date.parse(date)), 'Invalid end date'),
  reason: z.string().min(1, 'Reason is required'),
});

export const approveLeaveSchema = z.object({
  leaveRequestId: z.number().positive('Leave request ID must be positive'),
  approved: z.boolean(),
  rejectionReason: z.string().optional(),
});

export const scheduleSchema = z.object({
  employeeId: z.number().positive('Employee ID must be positive'),
  shiftDate: z.string().refine(date => !isNaN(Date.parse(date)), 'Invalid shift date'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be in HH:MM format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be in HH:MM format'),
  shiftType: z.enum(['MORNING', 'AFTERNOON', 'NIGHT', 'FULL_DAY']).optional(),
});

export const leaveTypeSchema = z.object({
  name: z.string().min(1, 'Leave type name is required'),
  daysPerYear: z.number().positive('Days per year must be positive'),
  carryForward: z.number().nonnegative('Carry forward cannot be negative').optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LeaveRequestInput = z.infer<typeof leaveRequestSchema>;
export type ApproveLeaveInput = z.infer<typeof approveLeaveSchema>;
export type ScheduleInput = z.infer<typeof scheduleSchema>;
export type LeaveTypeInput = z.infer<typeof leaveTypeSchema>;
