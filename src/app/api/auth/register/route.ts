import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import StudentProfile from '@/lib/db/models/StudentProfile';
import { registerSchema } from '@/lib/validation/schemas';
import type { ApiResponse } from '@/types';

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    await connectToDatabase();

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'student',
      emailVerified: false,
    });

    // Create student profile
    await StudentProfile.create({ userId: user._id });

    // Send welcome email (non-blocking)
    try {
      const { sendWelcomeEmail } = await import('@/lib/email');
      await sendWelcomeEmail(email, name);
    } catch (emailError) {
      // Don't fail registration if email fails
      console.error('Welcome email failed:', emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully!',
        data: { id: user._id.toString(), name: user.name, email: user.email },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
