import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import NewsletterSubscriber from '@/lib/db/models/NewsletterSubscriber';
import { newsletterSchema } from '@/lib/validation/schemas';
import type { ApiResponse } from '@/types';
import { sendEmail } from '@/lib/email';

// POST /api/newsletter - Subscribe
export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await req.json();
    const parsed = newsletterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message || 'Invalid data' }, { status: 400 });
    }

    await connectToDatabase();

    const sendWelcomeEmail = async (email: string) => {
      await sendEmail({
        to: email,
        subject: 'Welcome to EduBridge Agency Newsletter!',
        html: `
          <h2>Welcome to EduBridge Agency!</h2>
          <p>Thank you for subscribing to our newsletter.</p>
          <p>You will now receive the latest international scholarships and job opportunities directly in your inbox.</p>
          <br/>
          <p>Best regards,<br/>The EduBridge Agency Team</p>
        `
      });
    };

    const existing = await NewsletterSubscriber.findOne({ email: parsed.data.email.toLowerCase() });
    if (existing) {
      if (existing.active) {
        return NextResponse.json(
          { success: false, error: 'This email is already subscribed.' },
          { status: 409 }
        );
      }
      // Re-activate
      await NewsletterSubscriber.findByIdAndUpdate(existing._id, { active: true, ...parsed.data });
      await sendWelcomeEmail(parsed.data.email.toLowerCase());
      return NextResponse.json({ success: true, message: 'Subscription re-activated!' });
    }

    await NewsletterSubscriber.create({
      ...parsed.data,
      email: parsed.data.email.toLowerCase(),
    });
    
    await sendWelcomeEmail(parsed.data.email.toLowerCase());

    return NextResponse.json({ success: true, message: 'Subscribed successfully!' }, { status: 201 });
  } catch (error) {
    console.error('POST /api/newsletter error:', error);
    return NextResponse.json({ success: false, error: 'Subscription failed. Please try again.' }, { status: 500 });
  }
}

// DELETE /api/newsletter?token=... - Unsubscribe
export async function DELETE(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const token = new URL(req.url).searchParams.get('token');
    if (!token) {
      return NextResponse.json({ success: false, error: 'Token required' }, { status: 400 });
    }

    await connectToDatabase();

    const subscriber = await NewsletterSubscriber.findOneAndUpdate(
      { unsubscribeToken: token },
      { active: false }
    );

    if (!subscriber) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Unsubscribed successfully.' });
  } catch (error) {
    console.error('DELETE /api/newsletter error:', error);
    return NextResponse.json({ success: false, error: 'Unsubscribe failed.' }, { status: 500 });
  }
}
