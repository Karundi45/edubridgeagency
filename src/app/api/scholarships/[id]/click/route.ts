import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import Opportunity from '@/lib/db/models/Opportunity';
import type { ApiResponse } from '@/types';

// POST /api/scholarships/[id]/click - Track outbound click
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    await connectToDatabase();
    await Opportunity.findByIdAndUpdate(params.id, {
      $inc: { 'metrics.outboundClicks': 1 },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Tracking failed' }, { status: 500 });
  }
}
