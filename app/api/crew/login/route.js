import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { comparePassword, generateToken } from '@/lib/auth';

export async function POST(req) {
  try {
    const { crewMemberId, pin } = await req.json();

    if (!crewMemberId || !pin) {
      return NextResponse.json({ error: 'Missing team member or PIN' }, { status: 400 });
    }

    const member = await prisma.crewMember.findUnique({ where: { id: parseInt(crewMemberId) } });
    if (!member || !member.pinHash) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
    }

    const pinMatch = await comparePassword(pin, member.pinHash);
    if (!pinMatch) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
    }

    const token = generateToken(member.id, false, true);

    return NextResponse.json({ token, crewMemberId: member.id, name: member.name });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
