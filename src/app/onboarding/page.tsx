import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'

export default async function OnboardingPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  if (user.publicMetadata.onboardingComplete === true) {
    redirect('/dashboard')
  }

  redirect('/onboarding/quiz')
}
