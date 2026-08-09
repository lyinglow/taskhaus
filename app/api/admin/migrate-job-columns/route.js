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

    await prisma.$executeRawUnsafe(`ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "recurrence" TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "photoBeforeUrl" TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "photoAfterUrl" TEXT`);

    return NextResponse.json({
      success: true,
      message: 'recurrence, photoBeforeUrl, photoAfterUrl columns added to Job.',
    });
  } catch (err) {
    console.error('Migration error:', err);
    return NextResponse.json(
      { error: 'Migration failed', details: err.message },
      { status: 500 }
    );
  }
}
