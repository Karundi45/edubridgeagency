import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import { sendPasswordResetEmail } from '@/lib/email';
import type { ApiResponse } from '@/types';

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive a reset link.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await User.findByIdAndUpdate(user._id, {
      passwordResetToken: hashedToken,
      passwordResetExpires: expires,
    });

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(user.email, resetLink);

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive a reset link.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ success: false, error: 'Request failed. Please try again.' }, { status: 500 });
  }
}
