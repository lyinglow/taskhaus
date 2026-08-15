import { NextResponse } from 'next/server';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';
import nodemailer from 'nodemailer';

function verifyAdmin(req) {
  const token = getTokenFromHeader(req.headers.get('authorization'));
  if (token) {
    const decoded = verifyToken(token);
    if (decoded?.isAdmin) return true;
  }
  return false;
}

export async function POST(req) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const config = {
    NODE_ENV: process.env.NODE_ENV || null,
    SMTP_HOST: process.env.SMTP_HOST || null,
    SMTP_PORT: process.env.SMTP_PORT || null,
    SMTP_USER: process.env.SMTP_USER || null,
    SMTP_FROM: process.env.SMTP_FROM || null,
    ADMIN_NOTIFY_EMAIL: process.env.ADMIN_NOTIFY_EMAIL || null,
    SMTP_PASS_SET: !!process.env.SMTP_PASS
  };

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'services@thegardenunit.co.uk',
      to: process.env.ADMIN_NOTIFY_EMAIL || 'services@thegardenunit.co.uk',
      subject: 'Test email from admin diagnostic tool',
      html: '<p>If you received this, outgoing notification email is working.</p>'
    });
    return NextResponse.json({ ok: true, config, messageId: info.messageId, response: info.response });
  } catch (err) {
    return NextResponse.json({ ok: false, config, error: err.message, code: err.code }, { status: 500 });
  }
}
