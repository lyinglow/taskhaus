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

export async function PATCH(req, { params }) {
  try {
    if (!(await verifyAdmin(req))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = params;
    const { name, description, longDescription, toolsNeeded, price, category, isActive, requiresPhotoReview, partnerCredit, season } = await req.json();

    const service = await prisma.service.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(longDescription !== undefined && { longDescription }),
        ...(toolsNeeded !== undefined && { toolsNeeded }),
        ...(price !== undefined && { price }),
        ...(category !== undefined && { category }),
        ...(isActive !== undefined && { isActive }),
        ...(requiresPhotoReview !== undefined && { requiresPhotoReview }),
        ...(partnerCredit !== undefined && { partnerCredit }),
        ...(season !== undefined && { season }),
      },
    });

    return NextResponse.json(service);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}
