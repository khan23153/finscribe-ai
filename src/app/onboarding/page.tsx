import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'

export default async function OnboardingPage() {
  const { userId, sessionClaims } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  if (sessionClaims?.publicMetadata?.onboardingComplete) {
    redirect('/dashboard')
  }

  redirect('/onboarding/quiz')
}
