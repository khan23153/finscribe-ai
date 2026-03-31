import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt } = await req.json()

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        reply: 'AI service not configured. Please add ANTHROPIC_API_KEY in environment variables.'
      })
    }

    const response = await fetch(
      'https://api.anthropic.com/v1/messages',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: systemPrompt ||
            'You are FinScribe AI, a professional personal finance assistant for Indian users. Always respond in clear English only. Give practical, actionable financial advice. Use Indian currency (₹) and Indian financial context. Be concise and helpful.',
          messages: messages,
        }),
      }
    )

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic error:', err)
      return NextResponse.json({
        reply: 'AI service temporarily unavailable. Please try again.'
      })
    }

    const data = await response.json()
    const replyText = data?.content?.[0]?.text

    if (!replyText) {
      return NextResponse.json({
        reply: 'Could not generate a response. Please try again.'
      })
    }

    return NextResponse.json({ reply: replyText })
  } catch (error) {
    console.error('AI route error:', error)
    return NextResponse.json({
      reply: 'Something went wrong. Please try again.'
    })
  }
}
