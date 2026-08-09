import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, getTokenFromHeader, hashPassword } from '@/lib/auth';

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

    const crew = await prisma.crewMember.findMany();

    const crewWithStats = await Promise.all(
      crew.map(async (member) => {
        const stats = await prisma.job.count({
          where: {
            crewMemberId: member.id,
            status: 'completed'
          }
        });
        const { pinHash, ...rest } = member;
        return { ...rest, hasPin: !!pinHash, completedJobs: stats };
      })
    );

    return NextResponse.json(crewWithStats);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch crew' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    if (!(await verifyAdmin(req))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { name, age, skills, pin } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Name required' }, { status: 400 });
    }

    const member = await prisma.crewMember.create({
      data: {
        name,
        age: age ? parseInt(age) : null,
        skills: skills || null,
        pinHash: pin ? await hashPassword(pin) : null
      }
    });

    return NextResponse.json({ crewId: member.id }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to add crew member' }, { status: 500 });
  }
}
