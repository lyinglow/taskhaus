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

export async function PATCH(req, { params }) {
  try {
    if (!(await verifyAdmin(req))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { status } = await req.json();
    if (!['pending', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'status must be pending or completed' }, { status: 400 });
    }

    const payment = await prisma.payment.update({
      where: { id: parseInt(params.id) },
      data: {
        status,
        paidDate: status === 'completed' ? new Date() : null
      }
    });

    return NextResponse.json(payment);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
  }
}
