import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import Page from '@/lib/db/models/Page';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin' && session?.user?.role !== 'superadmin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const pages = await Page.find({}, 'slug title updatedAt').sort({ title: 1 });
    return NextResponse.json({ success: true, data: pages });
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch pages' }, { status: 500 });
  }
}
