import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { sendPartnerInquiryNotification } from '@/lib/email';

export async function POST(req) {
  try {
    const { businessName, contactName, email, phone, offerTypes, message } = await req.json();

    if (!businessName || !contactName || !email) {
      return NextResponse.json({ error: 'Business name, contact name and email are required' }, { status: 400 });
    }

    const inquiry = await prisma.partnerInquiry.create({
      data: {
        businessName,
        contactName,
        email,
        phone: phone || null,
        offerTypes: Array.isArray(offerTypes) ? offerTypes.join(', ') : (offerTypes || null),
        message: message || null
      }
    });

    await sendPartnerInquiryNotification(inquiry);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 });
  }
}
