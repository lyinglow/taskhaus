import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req, { params }) {
  try {
    const reviews = await prisma.review.findMany({
      where: { serviceId: parseInt(params.id) },
      orderBy: { createdAt: 'desc' }
    });

    const avgReview = await prisma.review.aggregate({
      where: { serviceId: parseInt(params.id) },
      _avg: { rating: true },
      _count: true
    });

    return NextResponse.json({
      reviews,
      avgRating: avgReview._avg.rating || 0,
      totalReviews: avgReview._count || 0
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
