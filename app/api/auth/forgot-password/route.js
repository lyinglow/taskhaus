import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';

const GENERIC_MESSAGE = "If an account exists for that email, we've sent a password reset link.";
const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    const parent = await prisma.parent.findUnique({ where: { email } });

    if (parent) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      await prisma.parent.update({
        where: { id: parent.id },
        data: {
          resetTokenHash: tokenHash,
          resetTokenExpiresAt: new Date(Date.now() + TOKEN_TTL_MS)
        }
      });

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const resetUrl = `${baseUrl}/?resetToken=${rawToken}`;
      await sendPasswordResetEmail(parent.email, parent.name, resetUrl);
    }

    return NextResponse.json({ message: GENERIC_MESSAGE });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
