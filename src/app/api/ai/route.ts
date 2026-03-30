import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    const lastMessage = messages[messages.length - 1]?.content || ''

    const payload = {
      n: 1,
      prompt: `You are FinScribe AI, a professional personal
finance assistant. Answer in English only. Give practical
financial advice only. User question: ${lastMessage}`,
      temperature: 0.7,
      top_p: 0.9
    }

    const response = await fetch(
      'https://us-central1-speed-app-a69c3.cloudfunctions.net/prod/api.live',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json; charset=UTF-8',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    )

    const data = await response.json()
    const reply = data?.choices?.[0]?.text ||
                  data?.text ||
                  data?.result ||
                  'Sorry, could not get a response.'

    return NextResponse.json({ reply })
  } catch (error) {
    console.error("API Route error:", error)
    return NextResponse.json({ reply: 'Internal server error.' }, { status: 500 })
  }
}
