import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { messages, systemPrompt } = await req.json()
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        system: systemPrompt || 'You are FinScribe AI, a professional personal finance assistant. Respond in clear English only. Give practical, actionable financial advice. Be concise and helpful.',
        messages,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
        console.error("Anthropic API error:", data)
        return NextResponse.json({ reply: `Error: ${data.error?.message || 'Failed to connect to AI.'}` }, { status: response.status })
    }

    return NextResponse.json({
      reply: data.content?.[0]?.text || 'Something went wrong.'
    })
  } catch (error) {
    console.error("API Route error:", error)
    return NextResponse.json({ reply: 'Internal server error.' }, { status: 500 })
  }
}
