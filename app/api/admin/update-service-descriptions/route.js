import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

const updates = [
  {
    name: 'Bin cleaning',
    description: 'Thorough cleaning of bins with deodorising',
    longDescription: "We give your bins a proper clean inside and out, removing built-up grime and odours, then apply a deodorising treatment to keep them fresh until the next collection. A quick way to stop your bin area smelling in the warmer months.",
  },
  {
    name: 'Bin numbering',
    description: 'Neatly painted or labelled house numbers on your bins',
    longDescription: "We paint or apply clear, weatherproof numbers to your bins so they're easy to identify and less likely to go missing or get mixed up with a neighbour's on collection day.",
  },
  {
    name: 'Weed removal',
    description: 'Weeds cleared from beds, borders and pathways',
    longDescription: "We hand-pull or dig out weeds from garden beds, borders and pathways, leaving the area tidy. Great for keeping on top of overgrowth between bigger garden jobs.",
  },
  {
    name: 'Loco shop pickup',
    description: 'We collect and deliver your Loco shop order',
    longDescription: "Can't get to the Loco shop yourself? We'll head down, collect your order and bring it straight to your door - handy if you're short on time or unable to get out.",
  },
  {
    name: 'Edge trimming',
    description: 'Crisp, defined edges along your lawn and borders',
    longDescription: "We trim the edges along your lawn, borders and pathways for a neat, defined finish - a small job that makes a big difference to how tidy your whole garden looks.",
  },
  {
    name: 'Logs to logstore',
    description: 'Logs moved and stacked neatly in your storage area',
    longDescription: "We'll carry and stack your logs into the logstore, keeping them organised and off the ground so they stay dry and ready to use.",
  },
  {
    name: 'Mulch installation',
    description: 'Fresh mulch spread across your garden beds',
    longDescription: "We spread a fresh layer of mulch across your garden beds, helping to lock in moisture, suppress weeds and give your borders a neat, finished look. Suitable for small to medium areas.",
  },
  {
    name: 'Locker delivery/pickup',
    description: 'We collect or deliver items to your locker',
    longDescription: "Whether you need something picked up from a locker or dropped off, we'll handle the trip for you - one less errand on your list.",
  },
  {
    name: 'Grass cutting',
    description: 'Professional grass cutting, tidied and supervised',
    longDescription: "Regular grass cutting to keep your lawn looking sharp, carried out by our team and overseen by an adult from start to finish. We'll cut, tidy the edges and clear away any cuttings.",
  },
  {
    name: 'Hedge trimming',
    description: 'Hedges trimmed and shaped, supervised for quality',
    longDescription: "We trim and shape your hedges to keep them looking neat and healthy, with every job overseen by an adult to make sure the standard is right. Cuttings are cleared away once we're done.",
  },
  {
    name: 'Shed painting',
    description: 'Exterior shed painting for a fresh, protected finish',
    longDescription: "We give your shed's exterior a fresh coat of paint, helping protect the wood and smarten up your garden. Larger sheds may need more than one visit - we'll let you know upfront if that's the case.",
  },
];

export async function POST(req) {
  try {
    const token = getTokenFromHeader(req.headers.get('authorization'));
    const decoded = token ? verifyToken(token) : null;
    if (!decoded?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    let updated = 0;
    let skipped = 0;

    for (const entry of updates) {
      const result = await prisma.service.updateMany({
        where: { name: entry.name },
        data: {
          description: entry.description,
          longDescription: entry.longDescription,
        },
      });
      if (result.count > 0) updated += result.count;
      else skipped++;
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updated} services. ${skipped > 0 ? `${skipped} name(s) not found.` : ''}`,
    });
  } catch (err) {
    console.error('Update error:', err);
    return NextResponse.json(
      { error: 'Update failed', details: err.message },
      { status: 500 }
    );
  }
}
