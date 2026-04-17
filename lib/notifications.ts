import { sendEmail, EmailTemplate } from './email';

export type NotificationEvent =
  | 'leave-approved'
  | 'leave-rejected'
  | 'leave-submitted'
  | 'user-created'
  | 'user-invited'
  | 'schedule-created';

export interface NotificationPayload {
  event: NotificationEvent;
  userId: number;
  tenantId: number;
  data: Record<string, unknown>;
}

// In-memory queue for notifications (in production, use Redis/Bull)
const notificationQueue: NotificationPayload[] = [];

export async function queueNotification(payload: NotificationPayload): Promise<void> {
  notificationQueue.push(payload);
  console.log('[QUEUE] Notification queued:', payload.event);

  // Process immediately in mock implementation
  await processNotification(payload);
}

export async function processNotification(payload: NotificationPayload): Promise<void> {
  try {
    console.log('[NOTIFICATION] Processing:', payload.event);

    switch (payload.event) {
      case 'leave-approved':
        await handleLeaveApproved(payload);
        break;
      case 'leave-rejected':
        await handleLeaveRejected(payload);
        break;
      case 'leave-submitted':
        await handleLeaveSubmitted(payload);
        break;
      case 'user-created':
        await handleUserCreated(payload);
        break;
      case 'user-invited':
        await handleUserInvited(payload);
        break;
      case 'schedule-created':
        await handleScheduleCreated(payload);
        break;
      default:
        console.warn('[NOTIFICATION] Unknown event type:', payload.event);
    }
  } catch (error) {
    console.error('[NOTIFICATION] Error processing notification:', error);
    // In production, retry logic would go here
  }
}

async function handleLeaveApproved(payload: NotificationPayload): Promise<void> {
  const { data } = payload;
  console.log('[NOTIFICATION] Leave approved for user:', data.employeeEmail);
  // Send email notification
  const emailPayload: EmailTemplate = {
    to: data.employeeEmail as string,
    subject: `Leave Request Approved: ${data.leaveType}`,
    template: 'leave-approved',
    variables: {
      employeeName: `${data.firstName} ${data.lastName}` as string,
      leaveType: data.leaveType as string,
      startDate: data.startDate as string,
      endDate: data.endDate as string,
    },
  };
  await sendEmail(emailPayload);
}

async function handleLeaveRejected(payload: NotificationPayload): Promise<void> {
  const { data } = payload;
  console.log('[NOTIFICATION] Leave rejected for user:', data.employeeEmail);
  const emailPayload: EmailTemplate = {
    to: data.employeeEmail as string,
    subject: `Leave Request Decision: ${data.leaveType}`,
    template: 'leave-rejected',
    variables: {
      employeeName: `${data.firstName} ${data.lastName}` as string,
      leaveType: data.leaveType as string,
      startDate: data.startDate as string,
      endDate: data.endDate as string,
      reason: data.rejectionReason as string,
    },
  };
  await sendEmail(emailPayload);
}

async function handleLeaveSubmitted(payload: NotificationPayload): Promise<void> {
  const { data } = payload;
  console.log('[NOTIFICATION] Leave submitted, notifying approver:', data.approverEmail);
  const emailPayload: EmailTemplate = {
    to: data.approverEmail as string,
    subject: `New Leave Request: ${data.leaveType} from ${data.firstName} ${data.lastName}`,
    template: 'leave-submitted',
    variables: {
      employeeName: `${data.firstName} ${data.lastName}` as string,
      leaveType: data.leaveType as string,
      startDate: data.startDate as string,
      endDate: data.endDate as string,
      approverName: data.approverName as string,
    },
  };
  await sendEmail(emailPayload);
}

async function handleUserCreated(payload: NotificationPayload): Promise<void> {
  const { data } = payload;
  console.log('[NOTIFICATION] User created:', data.email);
  const emailPayload: EmailTemplate = {
    to: data.email as string,
    subject: `Welcome to ${data.tenantName}!`,
    template: 'welcome',
    variables: {
      firstName: data.firstName as string,
      tenantName: data.tenantName as string,
    },
  };
  await sendEmail(emailPayload);
}

async function handleUserInvited(payload: NotificationPayload): Promise<void> {
  const { data } = payload;
  console.log('[NOTIFICATION] User invited:', data.email);
  const emailPayload: EmailTemplate = {
    to: data.email as string,
    subject: `You&apos;ve been invited to ${data.tenantName}`,
    template: 'user-invite',
    variables: {
      firstName: data.firstName as string,
      role: data.role as string,
      tenantName: data.tenantName as string,
      signupLink: data.signupLink as string,
    },
  };
  await sendEmail(emailPayload);
}

async function handleScheduleCreated(payload: NotificationPayload): Promise<void> {
  const { data } = payload;
  console.log('[NOTIFICATION] Schedule created for user:', data.employeeEmail);
  // Schedule notifications would be handled similarly
}

export function getQueueLength(): number {
  return notificationQueue.length;
}

export function getQueueStats(): {
  totalQueued: number;
  pendingCount: number;
} {
  return {
    totalQueued: notificationQueue.length,
    pendingCount: notificationQueue.filter((n) => !n).length,
  };
}
