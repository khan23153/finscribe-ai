import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/.well-known/assetlinks.json',
  '/manifest.webmanifest',
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req) && !req.nextUrl.pathname.startsWith('/api')) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|\\.well-known/assetlinks\\.json$|manifest\\.webmanifest$|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)$).*)',
    '/(api|trpc)(.*)',
  ],
}
