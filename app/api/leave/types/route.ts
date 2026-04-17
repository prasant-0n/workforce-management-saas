import { NextRequest, NextResponse } from 'next/server';
import { leaveTypeSchema } from '@/lib/schemas';
import { createLeaveType, getLeaveTypes } from '@/app/api/services/leave';
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

    // Only admins can create leave types
    if (!['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Validate input
    const validatedInput = leaveTypeSchema.parse(body);

    // Create leave type
    const result = await createLeaveType(
      user.tenantId,
      validatedInput.name,
      validatedInput.daysPerYear,
      validatedInput.carryForward || 0
    );

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

    const results = await getLeaveTypes(user.tenantId);

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
