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

    const customers = await prisma.parent.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        marketingOptIn: true,
        createdAt: true,
        _count: { select: { jobs: true } }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(customers.map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      address: c.address,
      marketingOptIn: c.marketingOptIn,
      createdAt: c.createdAt,
      jobCount: c._count.jobs
    })));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}
