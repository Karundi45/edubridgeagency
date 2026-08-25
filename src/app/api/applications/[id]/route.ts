import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import Application from '@/lib/db/models/Application';
import { auth } from '@/auth';
import type { ApiResponse } from '@/types';

// PUT /api/applications/[id] - Update application
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    await connectToDatabase();

    const body = await req.json();
    const application = await Application.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      body,
      { new: true }
    );

    if (!application) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: application });
  } catch (error) {
    console.error('PUT /api/applications/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
  }
}

// DELETE /api/applications/[id] - Delete application
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    await connectToDatabase();

    const application = await Application.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    });

    if (!application) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Application deleted' });
  } catch (error) {
    console.error('DELETE /api/applications/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Delete failed' }, { status: 500 });
  }
}
