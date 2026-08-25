import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import Job from '@/lib/db/models/Job';
import { auth } from '@/auth';
import { generateSlug } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'superadmin' && session.user.role !== 'editor')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    
    const skip = (page - 1) * pageSize;
    
    const [jobs, total] = await Promise.all([
      Job.find().sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
      Job.countDocuments()
    ]);
    
    return NextResponse.json({
      success: true,
      data: jobs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    });
    
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'superadmin' && session.user.role !== 'editor')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const data = await req.json();
    
    // Generate slug from title
    const slugBase = generateSlug(data.title.en);
    let slug = slugBase;
    let counter = 1;
    
    while (await Job.findOne({ slug })) {
      slug = `${slugBase}-${counter}`;
      counter++;
    }
    
    const job = await Job.create({
      ...data,
      slug,
      createdBy: session.user.id
    });
    
    return NextResponse.json({ success: true, data: job });
    
  } catch (error: any) {
    console.error('Job Creation Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to create job' }, { status: 500 });
  }
}
