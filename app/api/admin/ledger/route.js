import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

async function verifyAdmin(req) {
  const token = getTokenFromHeader(req.headers.get('authorization'));
  if (token) {
    const decoded = verifyToken(token);
    if (decoded?.isAdmin) return true;
  }
  return false;
}

export async function GET(req) {
  try {
    if (!(await verifyAdmin(req))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const detailed = await prisma.payment.findMany({
      include: {
        crewMember: true,
        parent: true,
        job: {
          include: { service: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const summary = await prisma.crewMember.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            jobs: {
              where: { status: 'completed' }
            }
          }
        },
        payments: {
          select: { amount: true }
        }
      }
    });

    return NextResponse.json({
      summary: summary.map(s => ({
        id: s.id,
        name: s.name,
        jobs_completed: s._count.jobs,
        earned: s.payments.reduce((sum, p) => sum + p.amount, 0)
      })),
      detailed: detailed.map(p => ({
        ...p,
        crewName: p.crewMember.name,
        serviceName: p.job.service?.name,
        customerName: p.parent.name,
        customerAddress: p.parent.address
      }))
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch ledger' }, { status: 500 });
  }
}
