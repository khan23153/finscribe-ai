import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt } = await req.json();
    const lastMessage = messages?.[messages.length - 1]?.content || "";

    const payload = {
      n: 1,
      prompt: systemPrompt || "You are FinScribe AI, a professional personal finance assistant. Answer in English only. Give practical financial advice only.",
      question: lastMessage,
      temperature: 0.7,
      top_p: 0.9
    };

    const response = await fetch('https://us-central1-speed-app-a69c3.cloudfunctions.net/prod/api.live', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API returned status: ${response.status}`);
    }

    const data = await response.json();
    // Strictly parse the OpenAI Chat Completion format
    const reply = data?.choices?.[0]?.message?.content || "Sorry, I received an empty response.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("AI API Error:", error);
    return NextResponse.json({ reply: "Something went wrong. Please try again." });
  }
}
