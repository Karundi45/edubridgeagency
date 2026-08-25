import OpenAI from 'openai';

// ============================================================
// AI Provider Abstraction Layer
// ============================================================

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIProvider {
  chat(messages: AIMessage[], systemPrompt?: string): Promise<string>;
  stream(
    messages: AIMessage[],
    systemPrompt?: string
  ): Promise<ReadableStream<Uint8Array>>;
}

// ============================================================
// OpenAI Provider
// ============================================================

function createOpenAIProvider(): AIProvider {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.AI_MODEL || 'gpt-4o';

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not configured.');
  }

  const client = new OpenAI({ apiKey });

  return {
    async chat(messages: AIMessage[], systemPrompt?: string): Promise<string> {
      const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

      if (systemPrompt) {
        chatMessages.push({ role: 'system', content: systemPrompt });
      }

      chatMessages.push(
        ...messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))
      );

      const response = await client.chat.completions.create({
        model,
        messages: chatMessages,
        max_tokens: 2000,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content ?? '';
    },

    async stream(
      messages: AIMessage[],
      systemPrompt?: string
    ): Promise<ReadableStream<Uint8Array>> {
      const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

      if (systemPrompt) {
        chatMessages.push({ role: 'system', content: systemPrompt });
      }

      chatMessages.push(
        ...messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))
      );

      const stream = await client.chat.completions.create({
        model,
        messages: chatMessages,
        max_tokens: 2000,
        temperature: 0.7,
        stream: true,
      });

      const encoder = new TextEncoder();

      return new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const text = chunk.choices[0]?.delta?.content ?? '';
              if (text) {
                controller.enqueue(encoder.encode(text));
              }
            }
            controller.close();
          } catch (err) {
            controller.error(err);
          }
        },
      });
    },
  };
}

// ============================================================
// Provider Factory
// ============================================================

let cachedProvider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cachedProvider) return cachedProvider;

  const provider = process.env.AI_PROVIDER || 'openai';

  switch (provider) {
    case 'openai':
      cachedProvider = createOpenAIProvider();
      break;
    // Future providers can be added here:
    // case 'anthropic': ...
    // case 'google': ...
    default:
      cachedProvider = createOpenAIProvider();
  }

  return cachedProvider;
}

// ============================================================
// Unconfigured (no API key) fallback
// ============================================================

export function createUnconfiguredProvider(providerName: string): AIProvider {
  const message = `EduBridge AI is not configured. The ${providerName} API key is missing. Please configure ${providerName.toUpperCase()}_API_KEY in your environment variables.`;
  const encoder = new TextEncoder();

  return {
    async chat() {
      return message;
    },
    async stream() {
      return new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(message));
          controller.close();
        },
      });
    },
  };
}

export function safeGetAIProvider(): AIProvider {
  try {
    return getAIProvider();
  } catch {
    return createUnconfiguredProvider('OpenAI');
  }
}
