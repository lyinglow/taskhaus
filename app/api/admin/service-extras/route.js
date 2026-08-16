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

export async function POST(req) {
  try {
    if (!(await verifyAdmin(req))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { serviceId, name, price } = await req.json();
    if (!serviceId || !name || price === undefined || price === null) {
      return NextResponse.json({ error: 'serviceId, name and price are required' }, { status: 400 });
    }

    const extra = await prisma.serviceExtra.create({
      data: {
        serviceId: parseInt(serviceId),
        name,
        price: parseFloat(price)
      }
    });

    return NextResponse.json(extra, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create extra' }, { status: 500 });
  }
}
