import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import Opportunity from '@/lib/db/models/Opportunity';
import { auth } from '@/auth';
import type { ApiResponse } from '@/types';

// POST /api/scholarships/[id]/verify - Admin verification
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();
    if (!session?.user || !['admin', 'superadmin'].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { status, sourceUrl, notes } = await req.json();

    if (status === 'verified' && !sourceUrl) {
      return NextResponse.json(
        { success: false, error: 'Source URL is required to mark an opportunity as verified.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const opportunity = await Opportunity.findByIdAndUpdate(
      params.id,
      {
        'verification.status': status,
        'verification.sourceUrl': sourceUrl || '',
        'verification.verifiedBy': session.user.id,
        'verification.verifiedAt': new Date(),
        'verification.notes': notes || '',
      },
      { new: true }
    );

    if (!opportunity) {
      return NextResponse.json({ success: false, error: 'Scholarship not found' }, { status: 404 });
    }

    // Log activity
    try {
      const { AdminActivity } = await import('@/lib/db/models');
      await AdminActivity.create({
        adminId: session.user.id,
        action: 'verify_opportunity',
        entity: 'Opportunity',
        entityId: params.id,
        metadata: { status, title: opportunity.title.en },
      });
    } catch {}

    return NextResponse.json({ success: true, data: opportunity, message: 'Verification updated' });
  } catch (error) {
    console.error('POST /api/scholarships/[id]/verify error:', error);
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 });
  }
}
