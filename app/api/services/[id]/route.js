import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    const { name, description, longDescription, toolsNeeded, price, category, isActive } = await req.json();

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
      },
    });

    return NextResponse.json(service);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}
