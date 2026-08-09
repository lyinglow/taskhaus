import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function GET(req) {
  try {
    const token = getTokenFromHeader(req.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const jobs = await prisma.job.findMany({
      where: { parentId: decoded.userId },
      include: {
        service: true,
        crewMember: true,
        review: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform to match expected format
    const transformed = jobs.map(job => ({
      ...job,
      serviceName: job.service?.name,
      crewName: job.crewMember?.name,
      quotedPrice: job.quotedPrice,
      finalPrice: job.finalPrice,
      timeWindow: job.timeWindow
    }));

    return NextResponse.json(transformed);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const token = getTokenFromHeader(req.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { serviceId, customRequest, recurrence } = await req.json();

    if (!serviceId && !customRequest) {
      return NextResponse.json({ error: 'Either serviceId or customRequest required' }, { status: 400 });
    }

    const validRecurrence = ['weekly', 'biweekly', 'monthly'].includes(recurrence) ? recurrence : null;

    const job = await prisma.job.create({
      data: {
        parentId: decoded.userId,
        serviceId: serviceId ? parseInt(serviceId) : null,
        customRequest: customRequest || null,
        status: 'pending',
        recurrence: validRecurrence
      }
    });

    return NextResponse.json({ jobId: job.id, status: 'pending' }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
