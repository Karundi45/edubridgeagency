const FROM = `${process.env.EMAIL_FROM_NAME || 'EduBridge Agency'} <${process.env.EMAIL_FROM || 'noreply@edubridge-agency.com'}>`;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Custom wrapper to replace the resend NPM package and fix peer dependency crashes forever
async function sendResendEmail(payload: { from: string, to: string, subject: string, html: string }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY missing. Email not sent:', payload.subject);
    return;
  }
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  }).catch(err => console.error('Failed to send email:', err));
}

// ============================================================
// Base HTML Template
// ============================================================

function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>EduBridge Agency</title>
</head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:Inter,Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:#1E40AF;padding:32px 40px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
        🎓 EduBridge Agency
      </h1>
      <p style="color:#93C5FD;margin:4px 0 0;font-size:14px;">Discover Opportunities. Build Your Future.</p>
    </div>
    <!-- Content -->
    <div style="padding:40px;">
      ${content}
    </div>
    <!-- Footer -->
    <div style="background:#F8FAFC;padding:24px 40px;text-align:center;border-top:1px solid #E2E8F0;">
      <p style="color:#64748B;font-size:12px;margin:0;">
        © ${new Date().getFullYear()} EduBridge Agency. All rights reserved.<br />
        <a href="${APP_URL}" style="color:#1E40AF;text-decoration:none;">Visit EduBridge Agency</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

// ============================================================
// Email Functions
// ============================================================

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const content = `
    <h2 style="color:#0F172A;margin:0 0 16px;font-size:22px;">Welcome, ${name}! 🎉</h2>
    <p style="color:#334155;line-height:1.6;">Your EduBridge Agency account is ready. You can now:</p>
    <ul style="color:#334155;line-height:2;">
      <li>Search thousands of scholarships and opportunities</li>
      <li>Save opportunities and track your applications</li>
      <li>Use EduBridge AI for personalized guidance</li>
      <li>Set deadline reminders</li>
    </ul>
    <div style="margin:32px 0;text-align:center;">
      <a href="${APP_URL}/dashboard" style="background:#1E40AF;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
        Go to Your Dashboard
      </a>
    </div>
    <p style="color:#64748B;font-size:14px;">Complete your profile to get personalized scholarship recommendations.</p>
  `;

  await sendResendEmail({
    from: FROM,
    to,
    subject: `Welcome to EduBridge Agency, ${name}!`,
    html: baseTemplate(content),
  });
}

export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  const content = `
    <h2 style="color:#0F172A;margin:0 0 16px;font-size:22px;">Reset Your Password</h2>
    <p style="color:#334155;line-height:1.6;">We received a request to reset your EduBridge Agency password. Click the button below to create a new password.</p>
    <div style="margin:32px 0;text-align:center;">
      <a href="${resetLink}" style="background:#1E40AF;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
        Reset Password
      </a>
    </div>
    <p style="color:#64748B;font-size:14px;">This link expires in 1 hour. If you did not request a password reset, please ignore this email.</p>
    <p style="color:#94A3B8;font-size:12px;word-break:break-all;">Or copy this link: ${resetLink}</p>
  `;

  await sendResendEmail({
    from: FROM,
    to,
    subject: 'Reset your EduBridge Agency password',
    html: baseTemplate(content),
  });
}

export async function sendEmailVerification(to: string, verifyLink: string): Promise<void> {
  const content = `
    <h2 style="color:#0F172A;margin:0 0 16px;font-size:22px;">Verify Your Email</h2>
    <p style="color:#334155;line-height:1.6;">Please verify your email address to complete your EduBridge Agency registration.</p>
    <div style="margin:32px 0;text-align:center;">
      <a href="${verifyLink}" style="background:#10B981;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
        Verify Email Address
      </a>
    </div>
    <p style="color:#64748B;font-size:14px;">This link expires in 24 hours.</p>
  `;

  await sendResendEmail({
    from: FROM,
    to,
    subject: 'Verify your EduBridge Agency email',
    html: baseTemplate(content),
  });
}

export async function sendDeadlineReminder(
  to: string,
  scholarshipName: string,
  deadline: string,
  daysLeft: number
): Promise<void> {
  const urgencyColor = daysLeft <= 3 ? '#EF4444' : daysLeft <= 7 ? '#F59E0B' : '#1E40AF';
  const content = `
    <h2 style="color:#0F172A;margin:0 0 16px;font-size:22px;">⏰ Deadline Reminder</h2>
    <div style="background:#FEF3C7;border:1px solid #FCD34D;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="margin:0;color:#92400E;font-weight:600;">${scholarshipName}</p>
      <p style="margin:4px 0 0;color:#B45309;">Deadline: ${deadline}</p>
    </div>
    <p style="color:#334155;line-height:1.6;">
      <span style="color:${urgencyColor};font-weight:700;font-size:18px;">${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining</span>
      — Don't miss your chance to apply!
    </p>
    <div style="margin:32px 0;text-align:center;">
      <a href="${APP_URL}/dashboard/applications" style="background:#1E40AF;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
        View My Applications
      </a>
    </div>
    <p style="color:#64748B;font-size:13px;border-top:1px solid #E2E8F0;padding-top:16px;margin-top:24px;">
      Always verify the current deadline on the official scholarship website before applying.
    </p>
  `;

  await sendResendEmail({
    from: FROM,
    to,
    subject: `⏰ ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left: ${scholarshipName}`,
    html: baseTemplate(content),
  });
}

export async function sendNewMatchingOpportunity(
  to: string,
  name: string,
  opportunity: { title: string; provider: string; deadline: string; url: string }
): Promise<void> {
  const content = `
    <h2 style="color:#0F172A;margin:0 0 8px;font-size:22px;">New Opportunity Match, ${name}! 🎯</h2>
    <p style="color:#334155;line-height:1.6;margin:0 0 24px;">We found a scholarship that matches your profile:</p>
    <div style="background:#F0FDF4;border:1px solid #6EE7B7;border-radius:8px;padding:20px;margin:0 0 24px;">
      <h3 style="margin:0 0 8px;color:#0F172A;font-size:18px;">${opportunity.title}</h3>
      <p style="margin:0 0 4px;color:#64748B;">Provider: <strong>${opportunity.provider}</strong></p>
      <p style="margin:0;color:#64748B;">Deadline: <strong>${opportunity.deadline}</strong></p>
    </div>
    <div style="margin:32px 0;text-align:center;">
      <a href="${opportunity.url}" style="background:#10B981;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
        View Opportunity
      </a>
    </div>
    <p style="color:#64748B;font-size:13px;border-top:1px solid #E2E8F0;padding-top:16px;margin-top:24px;">
      Always verify information on the official scholarship website.
    </p>
  `;

  await sendResendEmail({
    from: FROM,
    to,
    subject: `🎯 New scholarship match: ${opportunity.title}`,
    html: baseTemplate(content),
  });
}
