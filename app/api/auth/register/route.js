import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(req) {
  try {
    const { name, email, password, phone, address } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingParent = await prisma.parent.findUnique({ where: { email } });
    if (existingParent) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const parent = await prisma.parent.create({
      data: {
        name,
        email,
        passwordHash,
        phone: phone || null,
        address: address || null
      }
    });

    const token = generateToken(parent.id, false);

    return NextResponse.json(
      { parentId: parent.id, token, name: parent.name, email: parent.email },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
