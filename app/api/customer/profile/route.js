import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

async function getAuthedCustomer(req) {
  const token = getTokenFromHeader(req.headers.get('authorization'));
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded || decoded.isAdmin) return null;
  return decoded.userId;
}

export async function GET(req) {
  try {
    const customerId = await getAuthedCustomer(req);
    if (!customerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customer = await prisma.parent.findUnique({
      where: { id: customerId },
      select: { id: true, name: true, email: true, phone: true, address: true }
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const customerId = await getAuthedCustomer(req);
    if (!customerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, phone, address } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const existing = await prisma.parent.findUnique({ where: { email } });
    if (existing && existing.id !== customerId) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    const updated = await prisma.parent.update({
      where: { id: customerId },
      data: {
        name,
        email,
        phone: phone || null,
        address: address || null
      },
      select: { id: true, name: true, email: true, phone: true, address: true }
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
