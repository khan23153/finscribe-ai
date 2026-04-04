import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt } = await req.json()

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        reply: 'AI service not configured. Please add GEMINI_API_KEY.'
      })
    }

    // Convert messages to Gemini format
    const geminiMessages = messages.map((m: {
      role: string
      content: string
    }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }))

    // Add system prompt as first user message if provided
    const systemMessage = systemPrompt ||
      'You are FinScribe AI, a professional personal finance assistant for Indian users. Always respond in clear English only. Give practical, actionable financial advice. Use Indian currency (₹) and Indian financial context. Be concise and helpful.'

    const body = {
      system_instruction: {
        parts: [{ text: systemMessage }]
      },
      contents: geminiMessages,
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      }
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )

    if (!response.ok) {
      const err = await response.text()
      console.error('Gemini API error:', err)
      return NextResponse.json({
        reply: 'AI service temporarily unavailable. Please try again.'
      })
    }

    const data = await response.json()
    const replyText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text

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
