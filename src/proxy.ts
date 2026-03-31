import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims } = await auth()
  const path = request.nextUrl.pathname

  // Not logged in — protect private routes
  if (!userId && !isPublicRoute(request)) {
    return NextResponse.redirect(
      new URL('/sign-in', request.url)
    )
  }

  // Logged in user
  if (userId) {
    const isComplete =
      (sessionClaims?.metadata as any)?.onboardingComplete === true ||
      (sessionClaims?.publicMetadata as any)?.onboardingComplete === true

    // If onboarding not done and not already there
    if (!isComplete &&
        !path.startsWith('/onboarding') &&
        !path.startsWith('/api')) {
      return NextResponse.redirect(
        new URL('/onboarding', request.url)
      )
    }

    // If onboarding done and trying to go to onboarding
    if (isComplete && path.startsWith('/onboarding')) {
      return NextResponse.redirect(
        new URL('/dashboard', request.url)
      )
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
