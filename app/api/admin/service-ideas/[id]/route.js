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

    const { name, description, isActive } = await req.json();

    const idea = await prisma.serviceIdea.update({
      where: { id: parseInt(params.id) },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      }
    });

    return NextResponse.json(idea);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update service idea' }, { status: 500 });
  }
}
