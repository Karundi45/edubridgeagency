import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import SavedOpportunity from '@/lib/db/models/SavedOpportunity';
import Opportunity from '@/lib/db/models/Opportunity';
import { auth } from '@/auth';
import type { ApiResponse } from '@/types';

// POST /api/scholarships/[id]/save - Toggle save/unsave
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    await connectToDatabase();

    const existing = await SavedOpportunity.findOne({
      userId: session.user.id,
      opportunityId: params.id,
    });

    if (existing) {
      // Unsave
      await SavedOpportunity.findByIdAndDelete(existing._id);
      await Opportunity.findByIdAndUpdate(params.id, { $inc: { 'metrics.saves': -1 } });
      return NextResponse.json({ success: true, data: { saved: false }, message: 'Removed from saved' });
    } else {
      // Save
      await SavedOpportunity.create({ userId: session.user.id, opportunityId: params.id });
      await Opportunity.findByIdAndUpdate(params.id, { $inc: { 'metrics.saves': 1 } });
      return NextResponse.json({ success: true, data: { saved: true }, message: 'Saved successfully' });
    }
  } catch (error) {
    console.error('POST /api/scholarships/[id]/save error:', error);
    return NextResponse.json({ success: false, error: 'Save failed' }, { status: 500 });
  }
}
