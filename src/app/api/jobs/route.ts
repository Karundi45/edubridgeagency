import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import Job from '@/lib/db/models/Job';
import { PipelineStage } from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '12');
    const query = searchParams.get('query');
    const province = searchParams.getAll('province');
    const category = searchParams.getAll('category');
    const employmentType = searchParams.getAll('employmentType');
    const experienceLevel = searchParams.getAll('experienceLevel');
    const isFeatured = searchParams.get('isFeatured') === 'true';
    
    // Construct match query
    const matchQuery: any = {
      status: 'published',
      $or: [
        { deadline: { $exists: false } },
        { deadline: null },
        { deadline: { $gte: new Date() } }
      ]
    };
    
    if (isFeatured) matchQuery.isFeatured = true;
    if (province.length > 0) matchQuery.province = { $in: province };
    if (category.length > 0) matchQuery.category = { $in: category };
    if (employmentType.length > 0) matchQuery.employmentType = { $in: employmentType };
    if (experienceLevel.length > 0) matchQuery.experienceLevel = { $in: experienceLevel };
    
    if (query) {
      matchQuery.$text = { $search: query };
    }
    
    // Pagination & Sorting
    const skip = (page - 1) * pageSize;
    const sortParams: Record<string, 1 | -1> = query 
      ? { score: { $meta: 'textScore' }, isFeatured: -1, createdAt: -1 } as any
      : { isFeatured: -1, createdAt: -1 };
      
    const [jobs, total] = await Promise.all([
      Job.find(matchQuery)
        .sort(sortParams)
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Job.countDocuments(matchQuery)
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
    console.error('Jobs API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}
