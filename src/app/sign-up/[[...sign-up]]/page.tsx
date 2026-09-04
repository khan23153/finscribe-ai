import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'
import AuthMarketingPanel from '@/components/AuthMarketingPanel'

const clerkAppearance = {
  variables: {
    colorBackground: '#18181b',
    colorText: '#fafafa',
    colorTextSecondary: '#a1a1aa',
    colorPrimary: '#22c55e',
    colorInputBackground: '#27272a',
    colorInputText: '#fafafa',
    colorNeutral: '#fafafa',
    borderRadius: '0.75rem',
  },
  elements: {
    socialButtonsBlockButton: 'bg-zinc-800 border border-zinc-600 text-white hover:bg-zinc-700',
    socialButtonsBlockButtonText: 'text-white font-medium',
    dividerLine: 'bg-zinc-700',
    dividerText: 'text-zinc-400',
    formFieldLabel: 'text-zinc-300',
    identityPreviewText: 'text-white',
    identityPreviewEditButton: 'text-green-400',
  },
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      <AuthMarketingPanel />

      <main className="flex flex-col items-center justify-center p-8 bg-background relative z-10">
        <div className="lg:hidden mb-8">
          <Link href="/" className="font-display font-bold text-2xl flex items-center gap-2">
            FinScribe <span className="w-2 h-2 rounded-full bg-accent inline-block" /> AI
          </Link>
        </div>
        <SignUp fallbackRedirectUrl="/onboarding/quiz" appearance={clerkAppearance} />
      </main>
    </div>
  )
}
