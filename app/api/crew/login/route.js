import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { comparePassword, generateToken } from '@/lib/auth';

const LOCK_THRESHOLD = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

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

    if (member.pinLockedUntil && member.pinLockedUntil > new Date()) {
      return NextResponse.json({ error: 'Too many failed attempts. Please try again in 15 minutes.' }, { status: 429 });
    }

    const pinMatch = await comparePassword(pin, member.pinHash);
    if (!pinMatch) {
      const failedPinAttempts = (member.failedPinAttempts || 0) + 1;
      const lockedOut = failedPinAttempts >= LOCK_THRESHOLD;
      await prisma.crewMember.update({
        where: { id: member.id },
        data: {
          failedPinAttempts: lockedOut ? 0 : failedPinAttempts,
          pinLockedUntil: lockedOut ? new Date(Date.now() + LOCK_DURATION_MS) : null
        }
      });
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
    }

    if (member.failedPinAttempts) {
      await prisma.crewMember.update({ where: { id: member.id }, data: { failedPinAttempts: 0, pinLockedUntil: null } });
    }

    const token = generateToken(member.id, false, true);

    return NextResponse.json({ token, crewMemberId: member.id, name: member.name });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
