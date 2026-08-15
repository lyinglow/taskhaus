import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';
import { sendFeedbackNotification } from '@/lib/email';

export async function POST(req) {
  try {
    const token = getTokenFromHeader(req.headers.get('authorization'));
    const decoded = token ? verifyToken(token) : null;
    const parentId = decoded?.isAdmin || decoded?.isCrew ? null : decoded?.userId || null;

    const { name, email, appFeedback, serviceFeedback, qualityFeedback, otherFeedback } = await req.json();

    const hasContent = [appFeedback, serviceFeedback, qualityFeedback, otherFeedback].some(v => v && v.trim());
    if (!hasContent) {
      return NextResponse.json({ error: 'Please fill in at least one field' }, { status: 400 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        parentId,
        name: name || null,
        email: email || null,
        appFeedback: appFeedback || null,
        serviceFeedback: serviceFeedback || null,
        qualityFeedback: qualityFeedback || null,
        otherFeedback: otherFeedback || null
      }
    });

    await sendFeedbackNotification(feedback);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}
