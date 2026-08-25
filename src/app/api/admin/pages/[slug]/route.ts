import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import Page from '@/lib/db/models/Page';
import { auth } from '@/auth';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin' && session?.user?.role !== 'superadmin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const resolvedParams = await params;
    const page = await Page.findOne({ slug: resolvedParams.slug });
    
    if (!page) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: page });
  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch page' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin' && session?.user?.role !== 'superadmin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json({ success: false, error: 'Title and content are required' }, { status: 400 });
    }

    await connectToDatabase();
    const resolvedParams = await params;
    
    const page = await Page.findOneAndUpdate(
      { slug: resolvedParams.slug },
      { 
        title, 
        content,
        lastUpdatedBy: session.user.id 
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, data: page });
  } catch (error) {
    console.error('Error updating page:', error);
    return NextResponse.json({ success: false, error: 'Failed to update page' }, { status: 500 });
  }
}
