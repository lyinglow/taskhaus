import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function PATCH(req, { params }) {
  try {
    const token = getTokenFromHeader(req.headers.get('authorization'));
    const decoded = token ? verifyToken(token) : null;
    if (!decoded?.isCrew) {
      return NextResponse.json({ error: 'Team member access required' }, { status: 403 });
    }

    const jobId = parseInt(params.id);
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.crewMemberId !== decoded.userId) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const { photoBeforeUrl, photoAfterUrl, status } = await req.json();
    const data = {};
    if (photoBeforeUrl !== undefined) data.photoBeforeUrl = photoBeforeUrl;
    if (photoAfterUrl !== undefined) data.photoAfterUrl = photoAfterUrl;

    if (status !== undefined) {
      if (status !== 'review') {
        return NextResponse.json({ error: 'Team members can only mark a job ready for review' }, { status: 400 });
      }
      if (job.status !== 'confirmed') {
        return NextResponse.json({ error: 'Job must be confirmed before it can be marked ready for review' }, { status: 400 });
      }
      data.status = 'review';
    }

    await prisma.job.update({ where: { id: jobId }, data });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}
