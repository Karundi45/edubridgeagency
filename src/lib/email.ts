import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');
const fromEmail = process.env.EMAIL_FROM || 'noreply@edubridge-agency.com';
const fromName = process.env.EMAIL_FROM_NAME || 'EduBridge Agency';

export async function sendEmail({
  to,
  subject,
  html,
  text
}: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY is not set. Email not sent:', { to, subject });
      return { success: false, error: 'API key not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, ''), // fallback strip html
    });

    if (error) {
      console.error('Resend Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  return sendEmail({
    to: email,
    subject: 'Reset your EduBridge Agency password',
    html: `
      <h2>Password Reset Request</h2>
      <p>We received a request to reset your password. Click the link below to set a new password:</p>
      <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#1E40AF;color:white;text-decoration:none;border-radius:5px;margin:20px 0;">Reset Password</a>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `
  });
}
