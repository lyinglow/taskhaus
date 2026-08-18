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

    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "ServiceIdea" (
      "id" SERIAL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);

    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "ServiceInterest" (
      "id" SERIAL PRIMARY KEY,
      "serviceIdeaId" INTEGER NOT NULL REFERENCES "ServiceIdea"("id") ON DELETE CASCADE,
      "parentId" INTEGER NOT NULL REFERENCES "Parent"("id") ON DELETE CASCADE,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE ("serviceIdeaId", "parentId")
    )`);

    return NextResponse.json({
      success: true,
      message: 'ServiceIdea and ServiceInterest tables created.',
    });
  } catch (err) {
    console.error('Migration error:', err);
    return NextResponse.json(
      { error: 'Migration failed', details: err.message },
      { status: 500 }
    );
  }
}
