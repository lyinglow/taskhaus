import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { comparePassword, generateToken } from '@/lib/auth';

const LOCK_THRESHOLD = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    const parent = await prisma.parent.findUnique({ where: { email } });
    if (!parent) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (parent.loginLockedUntil && parent.loginLockedUntil > new Date()) {
      return NextResponse.json({ error: 'Too many failed attempts. Please try again in 15 minutes.' }, { status: 429 });
    }

    const passwordMatch = await comparePassword(password, parent.passwordHash);
    if (!passwordMatch) {
      const failedLoginAttempts = (parent.failedLoginAttempts || 0) + 1;
      const lockedOut = failedLoginAttempts >= LOCK_THRESHOLD;
      await prisma.parent.update({
        where: { id: parent.id },
        data: {
          failedLoginAttempts: lockedOut ? 0 : failedLoginAttempts,
          loginLockedUntil: lockedOut ? new Date(Date.now() + LOCK_DURATION_MS) : null
        }
      });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (parent.failedLoginAttempts) {
      await prisma.parent.update({ where: { id: parent.id }, data: { failedLoginAttempts: 0, loginLockedUntil: null } });
    }

    const token = generateToken(parent.id, false);

    return NextResponse.json({
      customerId: parent.id,
      token,
      name: parent.name,
      email: parent.email
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
