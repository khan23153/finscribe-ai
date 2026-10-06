import { SignIn } from '@clerk/nextjs'
import AuthLayout, { clerkAppearance } from '@/components/AuthLayout'

export default function SignInPage() {
  return (
    <AuthLayout>
      <SignIn fallbackRedirectUrl="/dashboard" appearance={clerkAppearance} />
    </AuthLayout>
  )
}
