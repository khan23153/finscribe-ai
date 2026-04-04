content = """import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt } = await req.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        reply: 'AI service not configured.'
      })
    }

    const systemText = systemPrompt ||
      'You are FinScribe AI, a professional personal finance assistant for Indian users. Respond in clear English only. Use Indian currency (₹). Be concise and helpful.'

    // Build contents array for Gemini
    const contents = []

    // Add conversation history
    for (const msg of messages) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })
    }

    // If no messages, add empty user message
    if (contents.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: 'Hello' }]
      })
    }

    const requestBody = {
      contents,
      systemInstruction: {
        parts: [{ text: systemText }]
      },
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      }
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Gemini error:', JSON.stringify(data))
      return NextResponse.json({
        reply: 'AI temporarily unavailable. Please try again.'
      })
    }

    const replyText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!replyText) {
      console.error('No text in Gemini response:', JSON.stringify(data))
      return NextResponse.json({
        reply: 'Could not generate response. Please try again.'
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
"""

with open('src/app/api/ai/route.ts', 'w') as f:
    f.write(content)
