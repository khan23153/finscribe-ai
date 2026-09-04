import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import DashboardShell from '@/components/DashboardShell'

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  if (user.publicMetadata.onboardingComplete !== true) {
    redirect('/onboarding/quiz')
  }

  return <DashboardShell>{children}</DashboardShell>
}
