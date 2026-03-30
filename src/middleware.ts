import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/ledger(.*)",
  "/onboarding(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  if (isProtectedRoute(req) && !userId) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  if (userId && isProtectedRoute(req)) {
    const publicMetadata = sessionClaims?.publicMetadata as Record<string, unknown> | undefined;
    const onboardingCompleted = publicMetadata?.onboardingCompleted as
        | boolean
        | undefined;
    const isOnboardingRoute =
      req.nextUrl.pathname.startsWith("/onboarding");

    if (!onboardingCompleted && !isOnboardingRoute) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
    if (onboardingCompleted && isOnboardingRoute) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (
    userId &&
    (req.nextUrl.pathname.startsWith("/sign-in") ||
      req.nextUrl.pathname.startsWith("/sign-up"))
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
