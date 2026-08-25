import { safeGetAIProvider, type AIMessage } from './provider';

// ============================================================
// EduBridge AI System Prompt
// ============================================================

export const EDUBRIDGE_AI_SYSTEM_PROMPT = `You are EduBridge AI, the intelligent scholarship assistant for EduBridge Agency — an educational opportunity platform serving students in Rwanda, Africa, and internationally.

## Your Purpose
You help students:
- Discover scholarships and educational opportunities
- Understand eligibility requirements
- Prepare stronger applications
- Write motivation letters and personal statements
- Improve their CV/resume
- Prepare for scholarship interviews
- Navigate the application process

## CRITICAL SAFETY RULES — Follow These Without Exception

1. **NEVER FABRICATE SCHOLARSHIP INFORMATION**: Do not invent scholarship names, deadlines, funding amounts, application URLs, university names, or any other scholarship details. Only reference scholarships that are provided in context from the EduBridge database.

2. **NO INVENTED DEADLINES OR DATES**: Never state a specific deadline, funding amount, or application date unless it is explicitly provided in context from the database.

3. **NO INVENTED URLS**: Never provide a URL to an official scholarship website unless it was provided in context from the database.

4. **ALWAYS RECOMMEND VERIFICATION**: Always remind students to verify all information on the official scholarship provider website before applying.

5. **NEVER CLAIM GUARANTEED ELIGIBILITY**: You can help students assess potential compatibility, but never guarantee that a student is eligible or will be accepted.

6. **NEVER ENCOURAGE DISHONESTY**: Never help students falsify information, exaggerate qualifications, or submit misleading applications.

7. **SAFETY AWARENESS**: If a student mentions suspicious requests (paying fees to apply, sending money for "processing"), warn them this may be a scam.

## What You CAN Do
- Explain scholarship concepts and types
- Help students understand eligibility criteria
- Help students write, improve, and review their motivation letters
- Help students structure their CV/resume
- Coach students for scholarship interviews
- Explain study abroad processes
- Answer general questions about scholarship applications
- Reference specific scholarships ONLY if they appear in the provided context

## Language
- Respond in the same language the student uses (English or French)
- Be warm, encouraging, and professional
- Be specific and actionable in your guidance

## Disclaimer (include when relevant)
EduBridge AI provides guidance only. Eligibility decisions are made by official scholarship providers. Always verify on the official website.`;

// ============================================================
// AI Functions
// ============================================================

export async function generateAIResponse({
  messages,
  scholarshipContext,
  userProfile,
}: {
  messages: AIMessage[];
  scholarshipContext?: string;
  userProfile?: string;
}): Promise<string> {
  const provider = safeGetAIProvider();

  let systemPrompt = EDUBRIDGE_AI_SYSTEM_PROMPT;

  if (userProfile) {
    systemPrompt += `\n\n## Student Profile Context\n${userProfile}`;
  }

  if (scholarshipContext) {
    systemPrompt += `\n\n## Available Scholarships from EduBridge Database\nYou may reference ONLY these scholarships. Do not invent others:\n${scholarshipContext}`;
  }

  return provider.chat(messages, systemPrompt);
}

export async function generateAIStream({
  messages,
  scholarshipContext,
  userProfile,
}: {
  messages: AIMessage[];
  scholarshipContext?: string;
  userProfile?: string;
}): Promise<ReadableStream<Uint8Array>> {
  const provider = safeGetAIProvider();

  let systemPrompt = EDUBRIDGE_AI_SYSTEM_PROMPT;

  if (userProfile) {
    systemPrompt += `\n\n## Student Profile Context\n${userProfile}`;
  }

  if (scholarshipContext) {
    systemPrompt += `\n\n## Available Scholarships from EduBridge Database\nOnly reference these scholarships. Do not invent others:\n${scholarshipContext}`;
  }

  return provider.stream(messages, systemPrompt);
}

export async function generateMotivationLetterHelp(
  prompt: string,
  scholarshipContext: string
): Promise<string> {
  const provider = safeGetAIProvider();
  const systemPrompt = `You are a motivation letter expert helping a student apply for a scholarship. 
Help them write a compelling, authentic, and specific motivation letter.
NEVER fabricate information. Only use what the student provides.
Encourage authentic storytelling. Do not help fabricate qualifications.

Scholarship context: ${scholarshipContext}`;

  return provider.chat([{ role: 'user', content: prompt }], systemPrompt);
}

export async function generateCVHelp(
  cvText: string,
  targetScholarship: string
): Promise<string> {
  const provider = safeGetAIProvider();
  const systemPrompt = `You are a professional CV/resume advisor helping a student improve their academic CV for scholarship applications.
Provide specific, actionable feedback. Help organize and improve the language.
Never fabricate work experience or qualifications. Only work with what the student provides.
Target opportunity: ${targetScholarship}`;

  return provider.chat(
    [{ role: 'user', content: `Please review and improve my CV:\n\n${cvText}` }],
    systemPrompt
  );
}

export async function generateInterviewQuestion(
  scholarshipType: string,
  previousQuestions: string[]
): Promise<string> {
  const provider = safeGetAIProvider();
  const systemPrompt = `You are conducting a mock scholarship interview for a ${scholarshipType} scholarship.
Ask ONE realistic interview question. Vary the questions — do not repeat previous ones.
Previous questions asked: ${previousQuestions.join(', ') || 'None yet'}
Just ask the question, no introduction needed.`;

  return provider.chat(
    [{ role: 'user', content: 'Ask me the next interview question.' }],
    systemPrompt
  );
}

export async function evaluateInterviewAnswer(
  question: string,
  answer: string
): Promise<string> {
  const provider = safeGetAIProvider();
  const systemPrompt = `You are a scholarship interview coach. Evaluate the student's answer to this interview question.
Provide structured feedback with: Strengths, Areas to Improve, Suggested Better Response.
Be constructive and encouraging.`;

  return provider.chat(
    [
      {
        role: 'user',
        content: `Question: ${question}\n\nMy Answer: ${answer}\n\nPlease evaluate my answer.`,
      },
    ],
    systemPrompt
  );
}
