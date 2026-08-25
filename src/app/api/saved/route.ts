import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import SavedOpportunity from '@/lib/db/models/SavedOpportunity';
import Application from '@/lib/db/models/Application';
import Notification from '@/lib/db/models/Notification';
import Report from '@/lib/db/models/Report';
import { auth } from '@/auth';
import type { ApiResponse } from '@/types';

// GET /api/saved - Get user's saved opportunities
export async function GET(_req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    await connectToDatabase();

    const saved = await SavedOpportunity.find({ userId: session.user.id })
      .populate('opportunityId')
      .sort({ savedAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    console.error('GET /api/saved error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch saved opportunities' }, { status: 500 });
  }
}
