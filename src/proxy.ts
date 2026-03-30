import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims } = await auth()

  if (!isPublicRoute(request)) {
    // Force authentication for private routes
    await auth.protect()

    const url = new URL(request.url)
    const isOnboardingRoute = url.pathname.startsWith('/onboarding')
    const onboardingComplete = sessionClaims?.publicMetadata?.onboardingComplete

    if (!onboardingComplete && !isOnboardingRoute) {
      // Redirect to onboarding if it's incomplete and trying to access the app
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    if (onboardingComplete && isOnboardingRoute) {
      // Redirect to dashboard if onboarding is already complete
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }
})

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
}
