import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function GET(req) {
  try {
    const token = getTokenFromHeader(req.headers.get('authorization'));
    const decoded = token ? verifyToken(token) : null;
    if (!decoded?.isCrew) {
      return NextResponse.json({ error: 'Team member access required' }, { status: 403 });
    }

    const payments = await prisma.payment.findMany({
      where: { crewMemberId: decoded.userId },
      include: { job: { include: { service: true } } },
      orderBy: { createdAt: 'desc' }
    });

    const transformed = payments.map(p => ({
      id: p.id,
      amount: p.amount,
      status: p.status,
      paidDate: p.paidDate,
      createdAt: p.createdAt,
      serviceName: p.job.service?.name || p.job.customRequest
    }));

    return NextResponse.json(transformed);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}
