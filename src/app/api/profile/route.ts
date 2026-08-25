import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import StudentProfile from '@/lib/db/models/StudentProfile';
import { auth } from '@/auth';
import { profileSchema } from '@/lib/validation/schemas';
import type { ApiResponse } from '@/types';

// GET /api/profile
export async function GET(_req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    await connectToDatabase();

    const profile = await StudentProfile.findOne({ userId: session.user.id }).lean();
    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error('GET /api/profile error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// PUT /api/profile
export async function PUT(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message || 'Invalid data' }, { status: 400 });
    }

    await connectToDatabase();

    const profile = await StudentProfile.findOneAndUpdate(
      { userId: session.user.id },
      { ...parsed.data },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json({ success: true, data: profile, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('PUT /api/profile error:', error);
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
  }
}
