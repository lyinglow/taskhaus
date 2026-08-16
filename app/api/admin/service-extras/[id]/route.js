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

export async function DELETE(req, { params }) {
  try {
    if (!(await verifyAdmin(req))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await prisma.serviceExtra.update({
      where: { id: parseInt(params.id) },
      data: { isActive: false }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to remove extra' }, { status: 500 });
  }
}
