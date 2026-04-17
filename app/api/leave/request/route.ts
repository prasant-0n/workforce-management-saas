import { NextRequest, NextResponse } from 'next/server';
import { leaveRequestSchema } from '@/lib/schemas';
import { createLeaveRequest, getLeaveRequests } from '@/app/api/services/leave';
import { verifyToken } from '@/lib/auth';
import { extractTokenFromHeader } from '@/lib/auth';

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
    const body = await request.json();

    // Validate input
    const validatedInput = leaveRequestSchema.parse(body);

    // Create leave request
    const result = await createLeaveRequest(user.userId, user.tenantId, validatedInput);

    return NextResponse.json(result, { status: 201 });
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

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    // Only managers and admins can view all requests
    if (!['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const status = request.nextUrl.searchParams.get('status');

    const results = await getLeaveRequests(user.tenantId, {
      status: status || undefined,
    });

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
