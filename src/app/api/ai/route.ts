import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const aiModeSchema = z.enum(['assistant', 'emi', 'stocks', 'news', 'report'])

const requestSchema = z.object({
  mode: aiModeSchema.default('assistant'),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().trim().min(1).max(4_000),
  }).strict()).min(1).max(20),
}).strict().refine(
  ({ messages }) => messages.reduce((total, message) => total + message.content.length, 0) <= 20_000,
  { message: 'Conversation is too long.', path: ['messages'] },
)

type AiMode = z.infer<typeof aiModeSchema>

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> }
    groundingMetadata?: {
      groundingChunks?: Array<{
        web?: { uri?: string; title?: string }
      }>
    }
  }>
  error?: { code?: number; message?: string; status?: string }
}

const systemPrompts: Record<AiMode, string> = {
  assistant:
    'You are FinScribe AI, a personal-finance education assistant for Indian users. Use clear English and Indian currency (₹). Be concise, explain assumptions, and never claim access to the user\'s accounts or transactions unless those figures appear in the prompt. For investments, provide general educational information and a risk disclaimer instead of personalized buy or sell instructions.',
  emi:
    'You are a loan education assistant for Indian users. Explain affordability factors and repayment tradeoffs in clear English. Do not claim to know the user\'s income unless supplied. Include a short risk disclaimer.',
  stocks:
    'You are an Indian-market research assistant, not a registered investment adviser. Use Google Search for current factual claims, distinguish facts from uncertainty, and include source-aware context and a risk disclaimer. Do not issue personalized buy or sell instructions.',
  news:
    `You are a financial-news curator for Indian readers. Today is ${new Date().toISOString().slice(0, 10)}. Use Google Search and return eight recent, verifiable items. Do not invent headlines, dates, prices, or events. Keep each summary factual and concise.`,
  report:
    'You are a personal-finance analysis assistant. Analyze only the figures supplied in the prompt, clearly label assumptions, and give concise, practical recommendations in English.',
}

const newsResponseSchema = {
  type: 'array',
  minItems: 1,
  maxItems: 8,
  items: {
    type: 'object',
    additionalProperties: false,
    properties: {
      title: { type: 'string' },
      summary: { type: 'string' },
      category: {
        type: 'string',
        enum: ['Markets', 'Economy', 'Crypto', 'Banking', 'RBI'],
      },
      sentiment: {
        type: 'string',
        enum: ['positive', 'negative', 'neutral'],
      },
      publishedAt: { type: 'string' },
    },
    required: ['title', 'summary', 'category', 'sentiment', 'publishedAt'],
  },
}

const requestsByUser = new Map<string, number[]>()
const rateLimitWindowMs = 60_000
const rateLimitMaxRequests = 12

function isRateLimited(userId: string) {
  const now = Date.now()
  const recentRequests = (requestsByUser.get(userId) ?? [])
    .filter((timestamp) => timestamp > now - rateLimitWindowMs)

  if (recentRequests.length >= rateLimitMaxRequests) {
    requestsByUser.set(userId, recentRequests)
    return true
  }

  recentRequests.push(now)
  requestsByUser.set(userId, recentRequests)
  return false
}

function normalizeMessages(messages: z.infer<typeof requestSchema>['messages']) {
  const contents: Array<{
    role: 'user' | 'model'
    parts: Array<{ text: string }>
  }> = []

  for (const message of messages) {
    const role = message.role === 'assistant' ? 'model' : 'user'

    // Gemini conversations should start with a user turn. The chatbot's local
    // welcome message is presentation state, not model history.
    if (contents.length === 0 && role === 'model') continue

    const previous = contents.at(-1)
    if (previous?.role === role) {
      previous.parts[0].text += `\n${message.content}`
    } else {
      contents.push({ role, parts: [{ text: message.content }] })
    }
  }

  return contents
}

function extractSources(data: GeminiResponse) {
  const chunks = data.candidates?.[0]?.groundingMetadata?.groundingChunks ?? []
  const uniqueSources = new Map<string, { title: string; url: string }>()

  for (const chunk of chunks) {
    const uri = chunk.web?.uri
    if (!uri) continue

    try {
      const url = new URL(uri)
      if (url.protocol !== 'https:' && url.protocol !== 'http:') continue
      uniqueSources.set(uri, {
        title: chunk.web?.title?.trim() || url.hostname,
        url: uri,
      })
    } catch {
      // Ignore malformed source URLs returned by the upstream service.
    }
  }

  return [...uniqueSources.values()].slice(0, 12)
}

export async function POST(request: Request) {
  try {
    const { isAuthenticated, userId } = await auth()
    if (!isAuthenticated || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (isRateLimited(userId)) {
      return NextResponse.json(
        { error: 'Too many AI requests. Please wait a minute and try again.' },
        { status: 429 },
      )
    }

    let rawBody: unknown
    try {
      rawBody = await request.json()
    } catch {
      return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 })
    }
    const parsed = requestSchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid AI request.' },
        { status: 400 },
      )
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim()
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI service is not configured.' },
        { status: 503 },
      )
    }

    const contents = normalizeMessages(parsed.data.messages)
    if (contents.length === 0 || contents.at(-1)?.role !== 'user') {
      return NextResponse.json(
        { error: 'The conversation must end with a user message.' },
        { status: 400 },
      )
    }

    const { mode } = parsed.data
    const generationConfig: Record<string, unknown> = {
      maxOutputTokens: mode === 'news' ? 2_048 : 1_024,
      temperature: mode === 'news' ? 0.2 : 0.6,
    }

    if (mode === 'news') {
      generationConfig.responseMimeType = 'application/json'
      generationConfig.responseJsonSchema = newsResponseSchema
    }

    const requestBody: Record<string, unknown> = {
      contents,
      systemInstruction: {
        parts: [{ text: systemPrompts[mode] }],
      },
      generationConfig,
    }

    if (mode === 'news' || mode === 'stocks') {
      requestBody.tools = [{ googleSearch: {} }]
    }

    const model = process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash'
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(25_000),
      },
    )

    const data = await response.json() as GeminiResponse

    if (!response.ok) {
      console.error('Gemini request failed', {
        status: response.status,
        code: data.error?.code,
        upstreamStatus: data.error?.status,
      })
      return NextResponse.json(
        {
          error: response.status === 429
            ? 'AI request limit reached. Please try again shortly.'
            : 'AI service is temporarily unavailable.',
        },
        { status: response.status === 429 ? 429 : 502 },
      )
    }

    const reply = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? '')
      .join('')
      .trim()

    if (!reply) {
      return NextResponse.json(
        { error: 'AI service returned an empty response.' },
        { status: 502 },
      )
    }

    return NextResponse.json({
      reply,
      sources: extractSources(data),
    })
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === 'TimeoutError'
    console.error('AI route failed', timedOut ? 'timeout' : 'unexpected error')
    return NextResponse.json(
      {
        error: timedOut
          ? 'AI service timed out. Please try again.'
          : 'Unable to process the AI request.',
      },
      { status: timedOut ? 504 : 500 },
    )
  }
}
