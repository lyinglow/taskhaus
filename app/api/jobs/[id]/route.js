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
        review: true
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
