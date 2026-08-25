import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import Opportunity from '@/lib/db/models/Opportunity';
import type { ApiResponse } from '@/types';

// GET /api/scholarships/closing-soon
export async function GET(_req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await connectToDatabase();

    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const opportunities = await Opportunity.find({
      status: 'published',
      deadline: { $gte: now, $lte: thirtyDaysLater },
    })
      .sort({ deadline: 1 })
      .limit(8)
      .lean();

    return NextResponse.json({ success: true, data: opportunities });
  } catch (error) {
    console.error('GET /api/scholarships/closing-soon error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch closing soon' }, { status: 500 });
  }
}
