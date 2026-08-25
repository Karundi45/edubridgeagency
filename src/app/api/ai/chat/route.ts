import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import { auth } from '@/auth';
import { generateAIStream } from '@/lib/ai/assistant';
import Opportunity from '@/lib/db/models/Opportunity';
import StudentProfile from '@/lib/db/models/StudentProfile';
import AIConversation from '@/lib/db/models/AIConversation';
import type { IAIMessage } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

// POST /api/ai/chat - AI chat with streaming
export async function POST(req: NextRequest): Promise<Response> {
  try {
    const session = await auth();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { messages, conversationId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await connectToDatabase();

    // Get student profile for context
    const profile = await StudentProfile.findOne({ userId: session.user.id }).lean();

    // Get relevant scholarships from DB for context (last 10 published)
    const scholarships = await Opportunity.find({ status: 'published' })
      .select('title.en provider country field degree fundingType deadline officialUrl')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const scholarshipContext = scholarships
      .map((s) => `- ${s.title.en} (${s.provider}, ${s.country}) - Deadline: ${s.deadline ? new Date(s.deadline).toLocaleDateString() : 'N/A'}`)
      .join('\n');

    const profileContext = profile
      ? `Student: ${session.user.name}, Nationality: ${(profile as { nationality?: string }).nationality || 'Not specified'}, Education: ${(profile as { educationLevel?: string }).educationLevel || 'Not specified'}, Field: ${(profile as { field?: string }).field || 'Not specified'}`
      : `Student: ${session.user.name}`;

    // Generate streaming response
    const stream = await generateAIStream({
      messages: messages.map((m: IAIMessage) => ({ role: m.role, content: m.content })),
      scholarshipContext,
      userProfile: profileContext,
    });

    // Save conversation history (non-blocking)
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage?.role === 'user') {
      AIConversation.findByIdAndUpdate(
        conversationId,
        {
          $push: {
            messages: {
              role: 'user',
              content: lastUserMessage.content,
              timestamp: new Date(),
            },
          },
          userId: session.user.id,
        },
        { upsert: true }
      ).catch(console.error);
    }

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('POST /api/ai/chat error:', error);
    return new Response(
      JSON.stringify({ error: 'AI service unavailable. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
