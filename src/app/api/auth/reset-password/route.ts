import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import type { ApiResponse } from '@/types';

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ success: false, error: 'Token and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    await connectToDatabase();

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'This reset link is invalid or has expired.' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await User.findByIdAndUpdate(user._id, {
      passwordHash,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
    });

    return NextResponse.json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ success: false, error: 'Reset failed. Please try again.' }, { status: 500 });
  }
}
