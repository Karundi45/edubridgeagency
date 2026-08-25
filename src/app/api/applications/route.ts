import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import Application from '@/lib/db/models/Application';
import { auth } from '@/auth';
import { applicationSchema } from '@/lib/validation/schemas';
import type { ApiResponse } from '@/types';

// GET /api/applications - Get user's applications
export async function GET(_req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    await connectToDatabase();

    const applications = await Application.find({ userId: session.user.id })
      .populate('opportunityId', 'title slug provider country deadline logo type')
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: applications });
  } catch (error) {
    console.error('GET /api/applications error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch applications' }, { status: 500 });
  }
}

// POST /api/applications - Create application record
export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = applicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message || 'Invalid data' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if already tracking this opportunity
    const existing = await Application.findOne({
      userId: session.user.id,
      opportunityId: parsed.data.opportunityId,
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'You are already tracking this opportunity.' },
        { status: 409 }
      );
    }

    const application = await Application.create({
      userId: session.user.id,
      ...parsed.data,
    });

    return NextResponse.json({ success: true, data: application }, { status: 201 });
  } catch (error) {
    console.error('POST /api/applications error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create application record' }, { status: 500 });
  }
}
