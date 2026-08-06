import nodemailer from 'nodemailer';

let transporter;

export function initializeEmail() {
  if (process.env.NODE_ENV === 'production') {
    // Use real SMTP in production
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
    // Use ethereal test account in dev
    transporter = nodemailer.createTransport({
      host: 'localhost',
      port: 1025,
      secure: false
    });
  }
}

export async function sendBookingConfirmation(parentEmail, parentName, jobId, serviceName, timeWindow, crewName) {
  const subject = `Your chore booking confirmed - Job #${jobId}`;
  const html = `
    <h2>Booking Confirmed!</h2>
    <p>Hi ${parentName},</p>
    <p>Your chore request has been confirmed:</p>
    <ul>
      <li><strong>Service:</strong> ${serviceName}</li>
      <li><strong>Time Window:</strong> ${timeWindow}</li>
      <li><strong>Crew Member:</strong> ${crewName}</li>
      <li><strong>Job ID:</strong> ${jobId}</li>
    </ul>
    <p>We'll let you know when the job is complete!</p>
    <p>Thanks,<br>The Chore Service Team</p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@choreservice.local',
      to: parentEmail,
      subject,
      html
    });
  } catch (err) {
    console.error('Error sending email:', err);
  }
}

export async function sendJobCompletionNotice(parentEmail, parentName, jobId, serviceName) {
  const subject = `Job complete - Please review! - Job #${jobId}`;
  const html = `
    <h2>Job Completed!</h2>
    <p>Hi ${parentName},</p>
    <p>Your ${serviceName} job has been completed!</p>
    <p>Please click below to rate your experience:</p>
    <p><a href="http://localhost:3000/review/${jobId}" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Leave a Review</a></p>
    <p>Job ID: ${jobId}</p>
    <p>Thanks,<br>The Chore Service Team</p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@choreservice.local',
      to: parentEmail,
      subject,
      html
    });
  } catch (err) {
    console.error('Error sending email:', err);
  }
}

export async function sendQuoteNotification(parentEmail, parentName, jobId, customRequest, quotePrice) {
  const subject = `Quote ready for your custom request - Job #${jobId}`;
  const html = `
    <h2>Custom Request Quote</h2>
    <p>Hi ${parentName},</p>
    <p>We have a quote for your request:</p>
    <p><strong>${customRequest}</strong></p>
    <p><strong>Quote: $${quotePrice}</strong></p>
    <p>Please reply or contact us to confirm if you'd like to proceed.</p>
    <p>Job ID: ${jobId}</p>
    <p>Thanks,<br>The Chore Service Team</p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@choreservice.local',
      to: parentEmail,
      subject,
      html
    });
  } catch (err) {
    console.error('Error sending email:', err);
  }
}
