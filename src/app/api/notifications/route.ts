import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import Notification from '@/lib/db/models/Notification';
import { auth } from '@/auth';
import type { ApiResponse } from '@/types';

// GET /api/notifications
export async function GET(_req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    await connectToDatabase();

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ userId: session.user.id })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      Notification.countDocuments({ userId: session.user.id, read: false }),
    ]);

    return NextResponse.json({ success: true, data: { notifications, unreadCount } });
  } catch (error) {
    console.error('GET /api/notifications error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// PUT /api/notifications - Mark all as read
export async function PUT(_req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    await connectToDatabase();
    await Notification.updateMany({ userId: session.user.id, read: false }, { read: true });

    return NextResponse.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('PUT /api/notifications error:', error);
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
  }
}
