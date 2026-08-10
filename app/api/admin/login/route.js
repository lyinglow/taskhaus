import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateToken, verifyAdminPassword } from '@/lib/auth';

const LOCK_THRESHOLD = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

async function getAttemptState() {
  try {
    const existing = await prisma.adminLoginAttempt.findUnique({ where: { id: 1 } });
    if (existing) return existing;
    return await prisma.adminLoginAttempt.create({ data: { id: 1 } });
  } catch (err) {
    // Table may not exist yet if the migration hasn't run - don't block login on that.
    console.error('AdminLoginAttempt unavailable, skipping lockout tracking:', err.message);
    return null;
  }
}

export async function POST(req) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ error: 'Missing password' }, { status: 400 });
    }

    const state = await getAttemptState();
    if (state?.lockedUntil && state.lockedUntil > new Date()) {
      return NextResponse.json({ error: 'Too many failed attempts. Please try again in 15 minutes.' }, { status: 429 });
    }

    if (verifyAdminPassword(password)) {
      if (state && (state.failedAttempts || state.lockedUntil)) {
        await prisma.adminLoginAttempt.update({ where: { id: 1 }, data: { failedAttempts: 0, lockedUntil: null } }).catch(() => {});
      }
      const token = generateToken(999, true);
      return NextResponse.json({ token, isAdmin: true });
    } else {
      if (state) {
        const failedAttempts = state.failedAttempts + 1;
        const lockedOut = failedAttempts >= LOCK_THRESHOLD;
        await prisma.adminLoginAttempt.update({
          where: { id: 1 },
          data: {
            failedAttempts: lockedOut ? 0 : failedAttempts,
            lockedUntil: lockedOut ? new Date(Date.now() + LOCK_DURATION_MS) : null
          }
        }).catch(() => {});
      }
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
