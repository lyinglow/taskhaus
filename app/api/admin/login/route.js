import { NextResponse } from 'next/server';
import { generateToken, verifyAdminPassword } from '@/lib/auth';

export async function POST(req) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ error: 'Missing password' }, { status: 400 });
    }

    if (verifyAdminPassword(password)) {
      const token = generateToken(999, true);
      return NextResponse.json({ token, isAdmin: true });
    } else {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
