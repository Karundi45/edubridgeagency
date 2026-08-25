import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import Opportunity from '@/lib/db/models/Opportunity';
import { generateSlug } from '@/lib/utils';
import type { ApiResponse } from '@/types';

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();
    if (!session?.user || !['admin', 'superadmin', 'editor'].includes(session.user.role as string)) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admins only' }, { status: 403 });
    }

    const body = await req.json();
    await connectToDatabase();

    // Generate slug from title (defaulting to English title if available)
    const titleText = body.title?.en || body.title?.fr || 'Untitled';
    let baseSlug = generateSlug(titleText);
    let slug = baseSlug;
    
    // Ensure unique slug
    let counter = 1;
    while (await Opportunity.exists({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const opportunityData = {
      ...body,
      slug,
      createdBy: session.user.id,
      metrics: { views: 0, saves: 0, outboundClicks: 0 },
    };

    const opportunity = await Opportunity.create(opportunityData);

    return NextResponse.json({ 
      success: true, 
      message: 'Scholarship created successfully',
      data: opportunity 
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating scholarship:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to create scholarship' }, { status: 500 });
  }
}
