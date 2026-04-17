import { NextRequest, NextResponse } from 'next/server';
import { approveLeaveSchema } from '@/lib/schemas';
import { approveLeaveRequest } from '@/app/api/services/leave';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    throw new Error('Unauthorized');
  }

  const payload = await verifyToken(token);
  return payload;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    // Only managers and admins can approve leaves
    if (!['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden - only managers can approve leaves' }, { status: 403 });
    }

    const body = await request.json();

    // Validate input
    const validatedInput = approveLeaveSchema.parse(body);

    // Approve leave request
    const result = await approveLeaveRequest(user.userId, user.tenantId, validatedInput);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message.includes('validation')) {
        return NextResponse.json(
          { error: 'Validation failed', details: error.message },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
