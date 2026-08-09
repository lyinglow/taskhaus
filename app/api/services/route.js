import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true }
    });
    return NextResponse.json(services);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name, description, longDescription, toolsNeeded, serviceType, category, price, requiresPhotoReview } = await req.json();

    const service = await prisma.service.create({
      data: {
        name,
        description,
        longDescription,
        toolsNeeded,
        serviceType,
        category: category || 'garden',
        price,
        isActive: true,
        requiresPhotoReview: requiresPhotoReview !== undefined ? requiresPhotoReview : true
      }
    });

    return NextResponse.json(service, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}
