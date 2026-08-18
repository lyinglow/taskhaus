import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function GET(req) {
  try {
    const token = getTokenFromHeader(req.headers.get('authorization'));
    const decoded = token ? verifyToken(token) : null;
    const parentId = decoded && !decoded.isAdmin && !decoded.isCrew ? decoded.userId : null;

    const ideas = await prisma.serviceIdea.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { interests: true } },
        interests: parentId ? { where: { parentId }, select: { id: true } } : false
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(ideas.map(idea => ({
      id: idea.id,
      name: idea.name,
      description: idea.description,
      interestCount: idea._count.interests,
      isInterested: parentId ? idea.interests.length > 0 : false
    })));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch service ideas' }, { status: 500 });
  }
}
