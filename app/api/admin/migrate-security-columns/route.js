import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function POST(req) {
  try {
    const token = getTokenFromHeader(req.headers.get('authorization'));
    const decoded = token ? verifyToken(token) : null;
    if (!decoded?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await prisma.$executeRawUnsafe(`ALTER TABLE "Parent" ADD COLUMN IF NOT EXISTS "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Parent" ADD COLUMN IF NOT EXISTS "loginLockedUntil" TIMESTAMP(3)`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "CrewMember" ADD COLUMN IF NOT EXISTS "failedPinAttempts" INTEGER NOT NULL DEFAULT 0`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "CrewMember" ADD COLUMN IF NOT EXISTS "pinLockedUntil" TIMESTAMP(3)`);
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "AdminLoginAttempt" ("id" SERIAL PRIMARY KEY, "failedAttempts" INTEGER NOT NULL DEFAULT 0, "lockedUntil" TIMESTAMP(3))`);

    return NextResponse.json({
      success: true,
      message: 'Login lockout columns/table added.',
    });
  } catch (err) {
    console.error('Migration error:', err);
    return NextResponse.json(
      { error: 'Migration failed', details: err.message },
      { status: 500 }
    );
  }
}
