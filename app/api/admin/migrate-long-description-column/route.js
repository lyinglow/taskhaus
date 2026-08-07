import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req) {
  try {
    const adminPassword = req.headers.get('x-admin-password');
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "longDescription" TEXT`
    );

    return NextResponse.json({
      success: true,
      message: 'longDescription column added.',
    });
  } catch (err) {
    console.error('Migration error:', err);
    return NextResponse.json(
      { error: 'Migration failed', details: err.message },
      { status: 500 }
    );
  }
}
