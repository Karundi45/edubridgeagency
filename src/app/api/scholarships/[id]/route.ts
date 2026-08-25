import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import Opportunity from '@/lib/db/models/Opportunity';
import { auth } from '@/auth';
import type { ApiResponse } from '@/types';

// GET /api/scholarships/[id] - Get single opportunity
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    await connectToDatabase();

    const { id } = params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    const opportunity = await Opportunity.findOne(
      isObjectId ? { _id: id } : { slug: id }
    );

    if (!opportunity) {
      return NextResponse.json({ success: false, error: 'Scholarship not found' }, { status: 404 });
    }

    // Increment views (non-blocking)
    Opportunity.findByIdAndUpdate(opportunity._id, { $inc: { 'metrics.views': 1 } }).exec();

    return NextResponse.json({ success: true, data: opportunity });
  } catch (error) {
    console.error('GET /api/scholarships/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch scholarship' }, { status: 500 });
  }
}

// PUT /api/scholarships/[id] - Update opportunity (admin/editor)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();
    if (!session?.user || !['admin', 'superadmin', 'editor'].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    await connectToDatabase();

    const body = await req.json();
    const opportunity = await Opportunity.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });

    if (!opportunity) {
      return NextResponse.json({ success: false, error: 'Scholarship not found' }, { status: 404 });
    }

    // Log activity
    try {
      const { AdminActivity } = await import('@/lib/db/models');
      await AdminActivity.create({
        adminId: session.user.id,
        action: 'update_opportunity',
        entity: 'Opportunity',
        entityId: params.id,
      });
    } catch {}

    return NextResponse.json({ success: true, data: opportunity });
  } catch (error) {
    console.error('PUT /api/scholarships/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
  }
}

// DELETE /api/scholarships/[id] - Delete opportunity (admin only)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();
    if (!session?.user || !['admin', 'superadmin'].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    await connectToDatabase();

    const opportunity = await Opportunity.findByIdAndDelete(params.id);
    if (!opportunity) {
      return NextResponse.json({ success: false, error: 'Scholarship not found' }, { status: 404 });
    }

    // Log activity
    try {
      const { AdminActivity } = await import('@/lib/db/models');
      await AdminActivity.create({
        adminId: session.user.id,
        action: 'delete_opportunity',
        entity: 'Opportunity',
        entityId: params.id,
        metadata: { title: opportunity.title.en },
      });
    } catch {}

    return NextResponse.json({ success: true, message: 'Scholarship deleted' });
  } catch (error) {
    console.error('DELETE /api/scholarships/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Delete failed' }, { status: 500 });
  }
}
