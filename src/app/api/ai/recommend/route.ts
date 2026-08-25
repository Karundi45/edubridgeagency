import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import { auth } from '@/auth';
import Opportunity from '@/lib/db/models/Opportunity';
import StudentProfile from '@/lib/db/models/StudentProfile';
import { calculateMatchScore } from '@/lib/matching/engine';
import type { ApiResponse, IOpportunity, IStudentProfile } from '@/types';

// POST /api/ai/recommend - Get AI-matched scholarship recommendations
export async function POST(_req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    await connectToDatabase();

    const profile = await StudentProfile.findOne({ userId: session.user.id }).lean();

    if (!profile) {
      return NextResponse.json({
        success: true,
        data: { recommendations: [], message: 'Complete your profile to get personalized recommendations.' },
      });
    }

    // Get published scholarships
    const opportunities = await Opportunity.find({
      status: 'published',
      $or: [{ deadline: { $gte: new Date() } }, { deadline: null }],
    })
      .limit(50)
      .lean();

    // Calculate match scores
    const scored = opportunities
      .map((opp) => ({
        opportunity: opp,
        match: calculateMatchScore(opp as unknown as IOpportunity, profile as unknown as IStudentProfile),
      }))
      .filter((item) => item.match.total >= 30) // Only show reasonable matches
      .sort((a, b) => b.match.total - a.match.total)
      .slice(0, 6);

    return NextResponse.json({
      success: true,
      data: {
        recommendations: scored.map(({ opportunity, match }) => ({
          opportunity,
          matchScore: match.total,
          matchReasons: match.reasons,
          missingInfo: match.missingInfo,
        })),
      },
    });
  } catch (error) {
    console.error('POST /api/ai/recommend error:', error);
    return NextResponse.json({ success: false, error: 'Recommendation failed' }, { status: 500 });
  }
}
