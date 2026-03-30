import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages || [];
    const lastMessage = messages.length > 0 ? messages[messages.length - 1].content : "";

    // Construct the payload matching the required API spec
    const payload = {
      n: 1,
      prompt: `You are FinScribe AI, a professional financial assistant. Answer the following query clearly and concisely: ${lastMessage}`,
      temperature: 0.7,
      top_p: 0.9
    };

    const response = await fetch("https://us-central1-speed-app-a69c3.cloudfunctions.net/prod/api.live", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload)
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
    return NextResponse.json({ reply: "Sorry, could not get a response. Please try again." }, { status: 500 });
  }
}
