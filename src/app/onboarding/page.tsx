import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'

export default async function OnboardingPage() {
  const { userId } = await auth()
  if (userId) redirect('/onboarding/quiz')
  redirect('/sign-in')
}
