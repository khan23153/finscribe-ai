import { clerkMiddleware, createRouteMatcher }
  from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  try {
    const { userId, sessionClaims } = await auth()
    const path = req.nextUrl.pathname

    // Always allow these
    if (isPublicRoute(req)) return NextResponse.next()
    if (path.startsWith('/api')) return NextResponse.next()
    if (path.startsWith('/_next')) return NextResponse.next()
    if (path.startsWith('/favicon')) return NextResponse.next()

    // Not logged in
    if (!userId) {
      return NextResponse.redirect(
        new URL('/sign-in', req.url)
      )
    }

    // Check bypass cookie first (set after onboarding)
    const bypassCookie = req.cookies.get(
      'onboarding-bypass'
    )
    if (bypassCookie?.value === 'true') {
      // User just completed onboarding
      // Allow everything except going back to onboarding
      if (path.startsWith('/onboarding')) {
        return NextResponse.redirect(
          new URL('/dashboard', req.url)
        )
      }
      return NextResponse.next()
    }

    // Check session claims for onboarding status
    const meta = (sessionClaims?.metadata ?? {}) as
      Record<string, unknown>
    const done = meta?.onboardingComplete === true

    if (done) {
      // Onboarding complete — allow everything
      if (path.startsWith('/onboarding')) {
        return NextResponse.redirect(
          new URL('/dashboard', req.url)
        )
      }
      return NextResponse.next()
    }

    // Onboarding NOT done — only allow /onboarding
    if (path.startsWith('/onboarding')) {
      return NextResponse.next()
    }

    // Everything else → go to onboarding
    return NextResponse.redirect(
      new URL('/onboarding', req.url)
    )

  } catch (err) {
    console.error('Middleware error:', err)
    // On any error, allow the request through
    return NextResponse.next()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
