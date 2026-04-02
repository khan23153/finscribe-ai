import { clerkMiddleware, createRouteMatcher }
  from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims } = await auth()
  const path = request.nextUrl.pathname

  // Always allow public routes
  if (isPublicRoute(request)) return

  // Always allow API routes - never redirect these
  if (path.startsWith('/api')) return

  // Not logged in
  if (!userId) {
    return NextResponse.redirect(
      new URL('/sign-in', request.url)
    )
  }

  // Get onboarding status from session claims
  const meta = (sessionClaims?.metadata ?? {}) as
    Record<string, unknown>
  const done = meta?.onboardingComplete === true

  // If onboarding done → allow everything
  // EXCEPT if somehow on /onboarding, go to dashboard
  if (done) {
    if (path.startsWith('/onboarding')) {
      return NextResponse.redirect(
        new URL('/dashboard', request.url)
      )
    }
    return // allow
  }

  // Onboarding NOT done:
  // Allow /onboarding pages
  if (path.startsWith('/onboarding')) return

  // Allow /dashboard ONLY if coming from onboarding
  // Check for special bypass cookie
  const bypassCookie = request.cookies.get(
    'onboarding-bypass'
  )
  if (bypassCookie?.value === 'true') {
    return // allow dashboard access
  }

  // Otherwise redirect to onboarding
  return NextResponse.redirect(
    new URL('/onboarding', request.url)
  )
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
