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

    const completedJobs = await prisma.job.findMany({
      where: { status: 'completed', crewMemberId: { not: null } },
      include: { service: true, payments: true }
    });

    let created = 0;
    for (const job of completedJobs) {
      if (job.payments.length > 0) continue;
      const amount = job.finalPrice || job.quotedPrice || job.service?.price || 0;
      if (amount <= 0) continue;
      await prisma.payment.create({
        data: {
          jobId: job.id,
          crewMemberId: job.crewMemberId,
          parentId: job.parentId,
          amount,
          status: 'pending'
        }
      });
      created++;
    }

    return NextResponse.json({
      success: true,
      message: `Backfilled ${created} payment record(s) for already-completed jobs.`,
    });
  } catch (err) {
    console.error('Backfill error:', err);
    return NextResponse.json(
      { error: 'Backfill failed', details: err.message },
      { status: 500 }
    );
  }
}
