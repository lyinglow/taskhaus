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

    const ideas = await prisma.serviceIdea.findMany({
      include: { _count: { select: { interests: true } } },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(ideas.map(idea => ({
      ...idea,
      interestCount: idea._count.interests
    })));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch service ideas' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    if (!(await verifyAdmin(req))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { name, description } = await req.json();
    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const idea = await prisma.serviceIdea.create({
      data: { name, description: description || null }
    });

    return NextResponse.json(idea, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create service idea' }, { status: 500 });
  }
}
