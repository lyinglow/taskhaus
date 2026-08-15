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

    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "Feedback" (
      "id" SERIAL PRIMARY KEY,
      "parentId" INTEGER REFERENCES "Parent"("id") ON DELETE SET NULL,
      "name" TEXT,
      "email" TEXT,
      "appFeedback" TEXT,
      "serviceFeedback" TEXT,
      "qualityFeedback" TEXT,
      "otherFeedback" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);

    await prisma.$executeRawUnsafe(`ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "partnerCredit" TEXT`);

    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "PartnerInquiry" (
      "id" SERIAL PRIMARY KEY,
      "businessName" TEXT NOT NULL,
      "contactName" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "phone" TEXT,
      "offerTypes" TEXT,
      "message" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);

    return NextResponse.json({
      success: true,
      message: 'Feedback and PartnerInquiry tables created.',
    });
  } catch (err) {
    console.error('Migration error:', err);
    return NextResponse.json(
      { error: 'Migration failed', details: err.message },
      { status: 500 }
    );
  }
}
