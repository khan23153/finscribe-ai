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

    if (isPublicRoute(req)) return NextResponse.next()
    if (path.startsWith('/api')) return NextResponse.next()
    if (path.startsWith('/_next')) return NextResponse.next()
    if (path.startsWith('/favicon')) return NextResponse.next()

    if (!userId) {
      return NextResponse.redirect(
        new URL('/sign-in', req.url)
      )
    }

    const meta = (sessionClaims?.metadata ?? {}) as
      Record<string, unknown>
    const done = meta?.onboardingComplete === true
    const bypass = req.cookies.get('onboarding-bypass')
    const hasBypass = bypass?.value === 'true'

    if (done || hasBypass) {
      if (path.startsWith('/onboarding')) {
        return NextResponse.redirect(
          new URL('/dashboard', req.url)
        )
      }
      return NextResponse.next()
    }

    if (path.startsWith('/onboarding')) {
      return NextResponse.next()
    }

    return NextResponse.redirect(
      new URL('/onboarding', req.url)
    )
  } catch (err) {
    console.error('Proxy error:', err)
    return NextResponse.next()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
