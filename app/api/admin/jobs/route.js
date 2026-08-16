import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, getTokenFromHeader, verifyAdminPassword } from '@/lib/auth';
import { sendBookingConfirmation, sendJobCompletionNotice } from '@/lib/email';

async function verifyAdmin(req) {
  const token = getTokenFromHeader(req.headers.get('authorization'));
  if (token) {
    const decoded = verifyToken(token);
    if (decoded?.isAdmin) return true;
  }
  return false;
}

export async function GET(req) {
  try {
    if (!(await verifyAdmin(req))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const jobs = await prisma.job.findMany({
      include: {
        parent: true,
        service: true,
        crewMember: true,
        extras: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const transformed = jobs.map(job => ({
      ...job,
      customerName: job.parent.name,
      customerEmail: job.parent.email,
      customerPhone: job.parent.phone,
      customerAddress: job.parent.address,
      serviceName: job.service?.name,
      crewName: job.crewMember?.name
    }));

    return NextResponse.json(transformed);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    if (!(await verifyAdmin(req))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { jobId, status, crewMemberId, quotedPrice, timeWindow, jobDate, notes } = await req.json();

    const updates = {};
    if (status) updates.status = status;
    if (crewMemberId) updates.crewMemberId = parseInt(crewMemberId);
    if (quotedPrice) updates.quotedPrice = parseFloat(quotedPrice);
    if (timeWindow) updates.timeWindow = timeWindow;
    if (jobDate) updates.jobDate = new Date(jobDate);
    if (notes) updates.notes = notes;
    if (status === 'completed') updates.completedAt = new Date();

    const job = await prisma.job.update({
      where: { id: parseInt(jobId) },
      data: updates,
      include: {
        parent: true,
        service: true,
        crewMember: true
      }
    });

    // Send emails
    if (status === 'confirmed') {
      await sendBookingConfirmation(
        job.parent.email,
        job.parent.name,
        job.id,
        job.service?.name || job.customRequest,
        job.timeWindow,
        job.crewMember?.name
      );
    }

    if (status === 'completed') {
      await sendJobCompletionNotice(
        job.parent.email,
        job.parent.name,
        job.id,
        job.service?.name
      );
    }

    let nextJobId = null;
    if (status === 'completed' && job.recurrence) {
      const nextDate = new Date();
      if (job.recurrence === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
      else if (job.recurrence === 'biweekly') nextDate.setDate(nextDate.getDate() + 14);
      else if (job.recurrence === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);

      const nextJob = await prisma.job.create({
        data: {
          parentId: job.parentId,
          serviceId: job.serviceId,
          crewMemberId: job.crewMemberId,
          status: 'confirmed',
          timeWindow: job.timeWindow,
          recurrence: job.recurrence,
          jobDate: nextDate
        }
      });
      nextJobId = nextJob.id;
    }

    return NextResponse.json({ jobId: job.id, updated: true, nextJobId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}
