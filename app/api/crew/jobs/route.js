import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function GET(req) {
  try {
    const token = getTokenFromHeader(req.headers.get('authorization'));
    const decoded = token ? verifyToken(token) : null;
    if (!decoded?.isCrew) {
      return NextResponse.json({ error: 'Team member access required' }, { status: 403 });
    }

    const jobs = await prisma.job.findMany({
      where: { crewMemberId: decoded.userId },
      include: { service: true, parent: true, extras: true },
      orderBy: { createdAt: 'desc' }
    });

    const transformed = jobs.map(job => ({
      id: job.id,
      status: job.status,
      timeWindow: job.timeWindow,
      customRequest: job.customRequest,
      serviceName: job.service?.name,
      serviceDescription: job.service?.longDescription || job.service?.description,
      toolsNeeded: job.service?.toolsNeeded,
      estimatedDuration: job.service?.estimatedDuration,
      customerName: job.parent.name,
      customerAddress: job.parent.address,
      completedAt: job.completedAt,
      quotedPrice: job.quotedPrice,
      finalPrice: job.finalPrice,
      servicePrice: job.service?.price,
      photoBeforeUrl: job.photoBeforeUrl,
      photoAfterUrl: job.photoAfterUrl,
      requiresPhotoReview: job.service ? job.service.requiresPhotoReview : true,
      extras: job.extras
    }));

    return NextResponse.json(transformed);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}
