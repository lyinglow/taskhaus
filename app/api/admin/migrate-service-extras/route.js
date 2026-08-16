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

    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "ServiceExtra" (
      "id" SERIAL PRIMARY KEY,
      "serviceId" INTEGER NOT NULL REFERENCES "Service"("id") ON DELETE CASCADE,
      "name" TEXT NOT NULL,
      "price" DOUBLE PRECISION NOT NULL,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);

    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "JobExtra" (
      "id" SERIAL PRIMARY KEY,
      "jobId" INTEGER NOT NULL REFERENCES "Job"("id") ON DELETE CASCADE,
      "serviceExtraId" INTEGER REFERENCES "ServiceExtra"("id") ON DELETE SET NULL,
      "name" TEXT NOT NULL,
      "price" DOUBLE PRECISION NOT NULL
    )`);

    return NextResponse.json({
      success: true,
      message: 'ServiceExtra and JobExtra tables created.',
    });
  } catch (err) {
    console.error('Migration error:', err);
    return NextResponse.json(
      { error: 'Migration failed', details: err.message },
      { status: 500 }
    );
  }
}
