import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

async function verifyAdmin(req) {
  const token = getTokenFromHeader(req.headers.get('authorization'));
  if (token) {
    const decoded = verifyToken(token);
    if (decoded?.isAdmin) return true;
  }
  return false;
}

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      include: { extras: { where: { isActive: true }, orderBy: { id: 'asc' } } },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(services);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    if (!(await verifyAdmin(req))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { name, description, longDescription, toolsNeeded, serviceType, category, price, requiresPhotoReview, partnerCredit, season } = await req.json();

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
        requiresPhotoReview: requiresPhotoReview !== undefined ? requiresPhotoReview : true,
        partnerCredit: partnerCredit || null,
        season: season || null
      }
    });

    return NextResponse.json(service, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}
