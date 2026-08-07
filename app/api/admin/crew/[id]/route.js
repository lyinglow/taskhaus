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

    const { id } = params;
    const { name, age, skills, isAvailable } = await req.json();

    const member = await prisma.crewMember.update({
      where: { id: parseInt(id) },
      data: {
        ...(name !== undefined && { name }),
        ...(age !== undefined && { age: age ? parseInt(age) : null }),
        ...(skills !== undefined && { skills: skills || null }),
        ...(isAvailable !== undefined && { isAvailable }),
      },
    });

    return NextResponse.json(member);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 });
  }
}
