import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { quizAnswersSchema } from '@/lib/onboarding'

export async function POST(req: Request) {
  try {
    const { isAuthenticated, userId } = await auth()

    if (!isAuthenticated || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 })
    }
    const result = quizAnswersSchema.safeParse(
      typeof body === 'object' && body !== null && 'answers' in body
        ? body.answers
        : undefined,
    )

    if (!result.success) {
      return NextResponse.json(
        { error: 'Please answer every onboarding question.' },
        { status: 400 },
      )
    }

    const client = await clerkClient()
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        onboardingComplete: true,
        quizAnswers: result.data,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[ONBOARDING_API_ERROR]', error)
    return NextResponse.json(
      { error: 'Unable to save onboarding preferences.' },
      { status: 500 },
    )
  }
}
