import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

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

    const { jobId, rating, comment } = await req.json();

    if (!jobId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid job or rating' }, { status: 400 });
    }

    const job = await prisma.job.findUnique({
      where: { id: parseInt(jobId) },
      include: { service: true }
    });

    if (!job || job.parentId !== decoded.userId) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (!job.serviceId) {
      return NextResponse.json({ error: 'Cannot review custom requests' }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        jobId: parseInt(jobId),
        serviceId: job.serviceId,
        parentId: decoded.userId,
        rating: parseInt(rating),
        comment: comment || null
      }
    });

    return NextResponse.json({ reviewId: review.id }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
