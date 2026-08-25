import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import Report from '@/lib/db/models/Report';
import { auth } from '@/auth';
import { reportSchema } from '@/lib/validation/schemas';
import type { ApiResponse } from '@/types';

// GET /api/reports - Admin: list reports
export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();
    if (!session?.user || !['admin', 'superadmin'].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const filter = status && status !== 'all' ? { status } : {};

    const reports = await Report.find(filter)
      .populate('userId', 'name email')
      .populate('opportunityId', 'title.en slug')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: reports });
  } catch (error) {
    console.error('GET /api/reports error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch reports' }, { status: 500 });
  }
}

// POST /api/reports - Submit a report
export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = reportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message || 'Invalid data' }, { status: 400 });
    }

    await connectToDatabase();

    const report = await Report.create({ userId: session.user.id, ...parsed.data });

    return NextResponse.json({ success: true, data: report, message: 'Report submitted. Thank you!' }, { status: 201 });
  } catch (error) {
    console.error('POST /api/reports error:', error);
    return NextResponse.json({ success: false, error: 'Report submission failed' }, { status: 500 });
  }
}
