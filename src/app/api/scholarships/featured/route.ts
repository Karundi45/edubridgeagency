import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import Opportunity from '@/lib/db/models/Opportunity';
import type { ApiResponse } from '@/types';

// GET /api/scholarships/featured
export async function GET(_req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await connectToDatabase();

    const opportunities = await Opportunity.find({
      isFeatured: true,
      status: 'published',
      $or: [{ deadline: { $gte: new Date() } }, { deadline: null }],
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    return NextResponse.json({ success: true, data: opportunities });
  } catch (error) {
    console.error('GET /api/scholarships/featured error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch featured scholarships' }, { status: 500 });
  }
}
