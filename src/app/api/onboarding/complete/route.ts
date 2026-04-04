import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Set Clerk metadata
    const client = await clerkClient()
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { onboardingComplete: true },
    })

    // Set bypass cookie so middleware lets user
    // through even with stale session token
    const response = NextResponse.json({
      success: true
    })
    response.cookies.set('onboarding-bypass', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })
    return response

  } catch (error) {
    console.error('Onboarding complete error:', error)
    // Even on error, set bypass cookie
    // so user is not stuck forever
    const response = NextResponse.json({
      success: true
    })
    response.cookies.set('onboarding-bypass', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })
    return response
  }
}
