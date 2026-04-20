import { NextRequest, NextResponse } from 'next/server';
import { updateUserRole, updateUserStatus, deleteUser, getUserById } from '@/app/api/services/user';
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    const { userId } = await params;
    const id = parseInt(userId);

    const result = await getUserById(id, user.tenantId);

    return NextResponse.json(result, { status: 200 });
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);

    // Only admins can update users
    if (!['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId } = await params;
    const id = parseInt(userId);
    const body = await request.json();

    let result;
    if (body.role) {
      result = await updateUserRole(user.tenantId, id, body.role);
    } else if (body.status) {
      result = await updateUserStatus(user.tenantId, id, body.status);
    } else {
      return NextResponse.json({ error: 'No valid update fields provided' }, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);

    // Only admins can delete users
    if (!['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId } = await params;
    const id = parseInt(userId);

    // Prevent self-deletion
    if (id === user.userId) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    const result = await deleteUser(user.tenantId, id);

    return NextResponse.json(result, { status: 200 });
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
