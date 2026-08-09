import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const crew = await prisma.crewMember.findMany({
      where: { pinHash: { not: null } },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(crew);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
  }
}
