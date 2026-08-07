import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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
      category: 'other',
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
      category: 'other',
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

  for (const service of services) {
    const existing = await prisma.service.findFirst({
      where: { name: service.name },
    });

    if (!existing) {
      await prisma.service.create({
        data: service,
      });
      console.log(`Created service: ${service.name}`);
    } else {
      console.log(`Service already exists: ${service.name}`);
    }
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
