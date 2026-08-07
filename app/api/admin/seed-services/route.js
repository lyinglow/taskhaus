import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

function mask(str) {
  if (!str) return null;
  if (str.length <= 4) return '*'.repeat(str.length);
  return str.slice(0, 2) + '*'.repeat(str.length - 4) + str.slice(-2);
}

export async function GET(req) {
  const adminPassword = req.headers.get('x-admin-password');
  const expected = process.env.ADMIN_PASSWORD;
  return NextResponse.json({
    envVarIsSet: typeof expected === 'string' && expected.length > 0,
    envVarLength: expected ? expected.length : 0,
    envVarPreview: mask(expected),
    receivedHeader: adminPassword !== null,
    receivedLength: adminPassword ? adminPassword.length : 0,
    receivedPreview: mask(adminPassword),
    matches: adminPassword === expected,
  });
}

export async function POST(req) {
  try {
    const adminPassword = req.headers.get('x-admin-password');
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const services = [
      {
        name: 'Bin cleaning',
        description: 'Thorough cleaning of bins with deodorising',
        serviceType: 'fixed',
        price: 10,
      },
      {
        name: 'Bin numbering',
        description: 'Painting or labelling bins with numbers',
        serviceType: 'fixed',
        price: 6,
      },
      {
        name: 'Weed removal',
        description: 'Remove weeds from garden beds and pathways',
        serviceType: 'fixed',
        price: 12,
      },
      {
        name: 'Loco shop pickup',
        description: 'Pick up and deliver items from Loco shop',
        serviceType: 'fixed',
        price: 15,
      },
      {
        name: 'Edge trimming',
        description: 'Neat edge trimming along garden borders and pathways',
        serviceType: 'fixed',
        price: 15,
      },
      {
        name: 'Logs to logstore',
        description: 'Organise and stack logs in storage area',
        serviceType: 'fixed',
        price: 18,
      },
      {
        name: 'Mulch installation',
        description: 'Spread mulch in garden beds (small to medium area)',
        serviceType: 'fixed',
        price: 25,
      },
      {
        name: 'Locker delivery/pickup',
        description: 'Deliver or pickup items from locker location',
        serviceType: 'fixed',
        price: 15,
      },
      {
        name: 'Grass cutting',
        description: 'Professional grass cutting and tidying (supervised)',
        serviceType: 'fixed',
        price: 30,
      },
      {
        name: 'Hedge trimming',
        description: 'Hedge trimming and shaping (supervised)',
        serviceType: 'fixed',
        price: 28,
      },
      {
        name: 'Shed painting',
        description: 'Shed exterior painting (size dependent, may require multiple visits)',
        serviceType: 'fixed',
        price: 50,
      },
    ];

    let created = 0;
    let skipped = 0;

    for (const service of services) {
      const existing = await prisma.service.findFirst({
        where: { name: service.name },
      });

      if (!existing) {
        await prisma.service.create({
          data: service,
        });
        created++;
      } else {
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seeding completed! Created: ${created}, Already existed: ${skipped}`,
      created,
      skipped,
      total: services.length,
    });
  } catch (err) {
    console.error('Seed error:', err);
    return NextResponse.json(
      { error: 'Failed to seed services', details: err.message },
      { status: 500 }
    );
  }
}
