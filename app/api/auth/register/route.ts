import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/schemas';
import { registerUser } from '@/app/api/services/auth';
import { runMigrations } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Run migrations on first request
    try {
      await runMigrations();
    } catch (migrationError) {
      console.log('Migrations already completed or in progress');
    }

    const body = await request.json();

    // Validate input
    const validatedInput = registerSchema.parse(body);

    // Register user
    const result = await registerUser(validatedInput);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
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
