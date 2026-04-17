export interface EmailTemplate {
  to: string;
  subject: string;
  template: string;
  variables: Record<string, string>;
}

// Mock email service - in production, integrate with SendGrid, Mailgun, etc.
export async function sendEmail(email: EmailTemplate): Promise<void> {
  console.log('[EMAIL] Sending email to:', email.to);
  console.log('[EMAIL] Subject:', email.subject);
  console.log('[EMAIL] Template:', email.template);
  console.log('[EMAIL] Variables:', email.variables);
  
  // In production, this would send the email via an email service
  // For now, we just log it
  return Promise.resolve();
}

export function getLeaveApprovedTemplate(variables: {
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
}): Omit<EmailTemplate, 'to'> {
  return {
    subject: `Leave Request Approved: ${variables.leaveType}`,
    template: 'leave-approved',
    variables,
  };
}

export function getLeaveRejectedTemplate(variables: {
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
}): Omit<EmailTemplate, 'to'> {
  return {
    subject: `Leave Request Decision: ${variables.leaveType}`,
    template: 'leave-rejected',
    variables,
  };
}

export function getLeaveSubmittedTemplate(variables: {
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  approverName: string;
}): Omit<EmailTemplate, 'to'> {
  return {
    subject: `New Leave Request: ${variables.leaveType} from ${variables.employeeName}`,
    template: 'leave-submitted',
    variables,
  };
}

export function getWelcomeTemplate(variables: {
  firstName: string;
  tenantName: string;
}): Omit<EmailTemplate, 'to'> {
  return {
    subject: `Welcome to ${variables.tenantName}!`,
    template: 'welcome',
    variables,
  };
}

export function getUserInviteTemplate(variables: {
  firstName: string;
  role: string;
  tenantName: string;
  signupLink: string;
}): Omit<EmailTemplate, 'to'> {
  return {
    subject: `You&apos;ve been invited to ${variables.tenantName}`,
    template: 'user-invite',
    variables,
  };
}
