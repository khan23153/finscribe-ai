import { SignUp } from '@clerk/nextjs'
import AuthLayout, { clerkAppearance } from '@/components/AuthLayout'

export default function SignUpPage() {
  return (
    <AuthLayout>
      <SignUp fallbackRedirectUrl="/onboarding/quiz" appearance={clerkAppearance} />
    </AuthLayout>
  )
}
