import re

with open('src/proxy.ts', 'r') as f:
    content = f.read()

# I will move the bypass cookie check to the top, before the !userId check,
# because the instruction says: "increase cookie bypass check priority — it should be the FIRST thing checked after public routes, before any JWT claims check."
# Wait, actually before any JWT claims check or before !userId check?
# "it should be the FIRST thing checked after public routes, before any JWT claims check."
# In the current proxy.ts, the bypass cookie check is before the JWT sessionClaims check `const meta = (sessionClaims?.metadata ?? {})`.
# But wait, we get userId and sessionClaims via `const { userId, sessionClaims } = await auth()` right at the start.
# If we want to check the bypass cookie before any auth/JWT checking...
# "it should be the FIRST thing checked after public routes, before any JWT claims check."

new_content = """import { clerkMiddleware, createRouteMatcher }
  from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  try {
    const path = req.nextUrl.pathname

    // Always allow these
    if (isPublicRoute(req)) return NextResponse.next()
    if (path.startsWith('/api')) return NextResponse.next()
    if (path.startsWith('/_next')) return NextResponse.next()
    if (path.startsWith('/favicon')) return NextResponse.next()

    // Check bypass cookie FIRST after public routes
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

    const { userId, sessionClaims } = await auth()

    // Not logged in
    if (!userId) {
      return NextResponse.redirect(
        new URL('/sign-in', req.url)
      )
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
"""

with open('src/proxy.ts', 'w') as f:
    f.write(new_content)
