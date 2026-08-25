import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import Opportunity from '@/lib/db/models/Opportunity';
import { auth } from '@/auth';
import { opportunitySchema } from '@/lib/validation/schemas';
import { generateSlug } from '@/lib/utils';
import type { ApiResponse, PaginatedResponse, IOpportunity, SearchFilters } from '@/types';

// GET /api/scholarships - List opportunities with search/filter/sort/pagination
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '12')));
    const query = searchParams.get('query') || '';
    const type = searchParams.getAll('type');
    const degree = searchParams.getAll('degree');
    const country = searchParams.getAll('country');
    const field = searchParams.getAll('field');
    const fundingType = searchParams.getAll('fundingType');
    const studyMode = searchParams.get('studyMode');
    const nationality = searchParams.get('nationality');
    const isFeatured = searchParams.get('isFeatured');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const status = searchParams.get('status') || 'published';

    // Build filter
    const filter: Record<string, unknown> = {};

    // Only admin can see non-published
    const session = await auth();
    const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'superadmin';
    const isEditor = session?.user?.role === 'editor';

    if (!isAdmin && !isEditor) {
      filter.status = 'published';
    } else if (status !== 'all') {
      filter.status = status;
    }

    // Text search
    if (query) {
      filter.$text = { $search: query };
    }

    if (type.length > 0) filter.type = { $in: type };
    if (degree.length > 0) filter.degree = { $in: degree };
    if (country.length > 0) filter.country = { $in: country };
    if (field.length > 0) filter.field = { $in: field };
    if (fundingType.length > 0) filter.fundingType = { $in: fundingType };
    if (studyMode) filter.studyMode = studyMode;
    if (nationality) filter.nationality = { $in: [nationality, 'All', 'International', 'African Students'] };
    if (isFeatured === 'true') filter.isFeatured = true;

    // Sort options
    const sortMap: Record<string, Record<string, number>> = {
      newest: { createdAt: -1 },
      deadline: { deadline: 1 },
      updated: { updatedAt: -1 },
      views: { 'metrics.views': -1 },
      saves: { 'metrics.saves': -1 },
      recommended: { isFeatured: -1, 'verification.status': -1, createdAt: -1 },
    };

    const sort = sortMap[sortBy] || sortMap.newest;

    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      Opportunity.find(filter).sort(sort).skip(skip).limit(pageSize).lean(),
      Opportunity.countDocuments(filter),
    ]);

    const response: PaginatedResponse<IOpportunity> = {
      data: data as unknown as IOpportunity[],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };

    return NextResponse.json({ success: true, ...response });
  } catch (error) {
    console.error('GET /api/scholarships error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch scholarships' }, { status: 500 });
  }
}

// POST /api/scholarships - Create opportunity (admin/editor only)
export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();
    if (!session?.user || !['admin', 'superadmin', 'editor'].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = opportunitySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message || 'Invalid data' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Auto-generate slug if not provided or duplicate
    let slug = parsed.data.slug || generateSlug(parsed.data.title.en);
    const existing = await Opportunity.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const opportunity = await Opportunity.create({
      ...parsed.data,
      slug,
      createdBy: session.user.id,
    });

    // Log admin activity
    try {
      const { AdminActivity } = await import('@/lib/db/models');
      await AdminActivity.create({
        adminId: session.user.id,
        action: 'create_opportunity',
        entity: 'Opportunity',
        entityId: opportunity._id.toString(),
        metadata: { title: parsed.data.title.en },
      });
    } catch {}

    return NextResponse.json({ success: true, data: opportunity }, { status: 201 });
  } catch (error) {
    console.error('POST /api/scholarships error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create scholarship' }, { status: 500 });
  }
}
