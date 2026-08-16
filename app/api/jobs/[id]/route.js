import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    const token = getTokenFromHeader(req.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const job = await prisma.job.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        service: true,
        crewMember: true,
        review: true,
        extras: true
      }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.parentId !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({
      ...job,
      serviceName: job.service?.name,
      crewName: job.crewMember?.name
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const token = getTokenFromHeader(req.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { status } = await req.json();
    if (status !== 'cancelled') {
      return NextResponse.json({ error: 'Customers can only cancel a request' }, { status: 400 });
    }

    const job = await prisma.job.findUnique({ where: { id: parseInt(params.id) } });
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    if (job.parentId !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    if (job.status !== 'pending' && job.status !== 'quoted') {
      return NextResponse.json({ error: 'This request can no longer be cancelled - please contact us' }, { status: 400 });
    }

    await prisma.job.update({ where: { id: job.id }, data: { status: 'cancelled' } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to cancel request' }, { status: 500 });
  }
}
