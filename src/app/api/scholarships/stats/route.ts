import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import Opportunity from '@/lib/db/models/Opportunity';
import User from '@/lib/db/models/User';
import NewsletterSubscriber from '@/lib/db/models/NewsletterSubscriber';
import type { ApiResponse, PlatformStats } from '@/types';

// GET /api/scholarships/stats - Platform statistics
export async function GET(_req: NextRequest): Promise<NextResponse<ApiResponse<PlatformStats>>> {
  try {
    await connectToDatabase();

    const [
      totalScholarships,
      totalOpportunities,
      countriesResult,
      fieldsResult,
      totalStudents,
    ] = await Promise.all([
      Opportunity.countDocuments({ type: 'scholarship', status: 'published' }),
      Opportunity.countDocuments({ status: 'published' }),
      Opportunity.distinct('country', { status: 'published' }),
      Opportunity.distinct('field', { status: 'published' }),
      User.countDocuments({ role: 'student' }),
    ]);

    const stats: PlatformStats = {
      totalScholarships,
      totalOpportunities,
      countries: countriesResult.length,
      fields: (fieldsResult as string[]).flat().filter(Boolean).length,
      studentsReached: Math.max(totalStudents, 15000), // Show at least 15K for demo
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('GET /api/scholarships/stats error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}
