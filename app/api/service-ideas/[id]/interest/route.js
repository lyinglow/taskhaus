import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function POST(req, { params }) {
  try {
    const token = getTokenFromHeader(req.headers.get('authorization'));
    const decoded = token ? verifyToken(token) : null;
    if (!decoded || decoded.isAdmin || decoded.isCrew) {
      return NextResponse.json({ error: 'Customer login required' }, { status: 403 });
    }

    const serviceIdeaId = parseInt(params.id);
    const parentId = decoded.userId;

    const existing = await prisma.serviceInterest.findUnique({
      where: { serviceIdeaId_parentId: { serviceIdeaId, parentId } }
    });

    if (existing) {
      await prisma.serviceInterest.delete({ where: { id: existing.id } });
      return NextResponse.json({ isInterested: false });
    }

    await prisma.serviceInterest.create({ data: { serviceIdeaId, parentId } });
    return NextResponse.json({ isInterested: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update interest' }, { status: 500 });
  }
}
