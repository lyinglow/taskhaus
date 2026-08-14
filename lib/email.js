import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (process.env.NODE_ENV === 'production') {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    transporter = nodemailer.createTransport({
      host: 'localhost',
      port: 1025,
      secure: false
    });
  }

  return transporter;
}

export async function sendBookingConfirmation(parentEmail, parentName, jobId, serviceName, timeWindow, crewName) {
  const subject = `Your service booking confirmed - Service #${jobId}`;
  const html = `
    <h2>Booking Confirmed!</h2>
    <p>Hi ${parentName},</p>
    <p>Your service request has been confirmed:</p>
    <ul>
      <li><strong>Service:</strong> ${serviceName}</li>
      <li><strong>Time Window:</strong> ${timeWindow}</li>
      <li><strong>Team Member:</strong> ${crewName}</li>
      <li><strong>Service ID:</strong> ${jobId}</li>
    </ul>
    <p>We'll let you know when the service is complete!</p>
    <p>Thanks,<br>The Garden Unit Team</p>
  `;

  try {
    await getTransporter().sendMail({
      from: process.env.SMTP_FROM || 'noreply@gardenunit.local',
      to: parentEmail,
      subject,
      html
    });
  } catch (err) {
    console.error('Error sending email:', err);
  }
}

export async function sendJobCompletionNotice(parentEmail, parentName, jobId, serviceName) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const subject = `Service complete - Please review! - Service #${jobId}`;
  const html = `
    <h2>Service Completed!</h2>
    <p>Hi ${parentName},</p>
    <p>Your ${serviceName} service has been completed!</p>
    <p>Please click below to rate your experience:</p>
    <p><a href="${baseUrl}/review/${jobId}" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Leave a Review</a></p>
    <p>Service ID: ${jobId}</p>
    <p>Thanks,<br>The Garden Unit Team</p>
  `;

  try {
    await getTransporter().sendMail({
      from: process.env.SMTP_FROM || 'noreply@gardenunit.local',
      to: parentEmail,
      subject,
      html
    });
  } catch (err) {
    console.error('Error sending email:', err);
  }
}

export async function sendPasswordResetEmail(parentEmail, parentName, resetUrl) {
  const subject = 'Reset your password - The Garden Unit';
  const html = `
    <h2>Reset your password</h2>
    <p>Hi ${parentName},</p>
    <p>We received a request to reset your password. Click below to choose a new one - this link expires in 1 hour.</p>
    <p><a href="${resetUrl}" style="background: #647A3B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
    <p>If you didn't request this, you can safely ignore this email.</p>
    <p>Thanks,<br>The Garden Unit Team</p>
  `;

  try {
    await getTransporter().sendMail({
      from: process.env.SMTP_FROM || 'noreply@gardenunit.local',
      to: parentEmail,
      subject,
      html
    });
  } catch (err) {
    console.error('Error sending email:', err);
  }
}

export async function sendQuoteNotification(parentEmail, parentName, jobId, customRequest, quotePrice) {
  const subject = `Quote ready for your custom request - Service #${jobId}`;
  const html = `
    <h2>Custom Request Quote</h2>
    <p>Hi ${parentName},</p>
    <p>We have a quote for your request:</p>
    <p><strong>${customRequest}</strong></p>
    <p><strong>Quote: £${quotePrice}</strong></p>
    <p>Please reply or contact us to confirm if you'd like to proceed.</p>
    <p>Service ID: ${jobId}</p>
    <p>Thanks,<br>The Garden Unit Team</p>
  `;

  try {
    await getTransporter().sendMail({
      from: process.env.SMTP_FROM || 'noreply@gardenunit.local',
      to: parentEmail,
      subject,
      html
    });
  } catch (err) {
    console.error('Error sending email:', err);
  }
}
