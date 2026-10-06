'use client'

import Link from 'next/link'
import { createElement } from 'react'
import { useUser } from '@clerk/nextjs'
import { ArrowRight, Check, Compass, Crosshair, Hammer, TrendingUp } from 'lucide-react'
import { LogoMark } from '@/components/Logo'
import { Spinner, buttonClass } from '@/components/ui'
import { getFinancialPersonality, quizAnswersSchema } from '@/lib/onboarding'

const personalityIcons = {
  'The Optimizer': Crosshair,
  'The Strategist': TrendingUp,
  'The Explorer': Compass,
  'The Builder': Hammer,
} as const

export default function ResultPage() {
  const { isLoaded, user } = useUser()

  if (!isLoaded) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }

  const parsedAnswers = quizAnswersSchema.safeParse(user?.publicMetadata.quizAnswers)

  if (!parsedAnswers.success) {
    return (
      <Frame>
        <h1 className="text-2xl font-semibold tracking-tight">No profile yet</h1>
        <p className="mt-2 text-foreground-2">Answer five quick questions to get a starting plan.</p>
        <Link href="/onboarding/quiz" className={buttonClass('primary', 'lg', 'mt-8')}>Start setup</Link>
      </Frame>
    )
  }

  const personality = getFinancialPersonality(parsedAnswers.data)
  const icon = personalityIcons[personality.name as keyof typeof personalityIcons] ?? Compass

  return (
    <Frame>
      <span className="h-12 w-12 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
        {createElement(icon, { size: 22 })}
      </span>
      <p className="mt-6 text-sm text-muted">Your money style</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{personality.name}</h1>
      <p className="mt-3 text-foreground-2 leading-relaxed">{personality.description}</p>

      <div className="mt-8 rounded-xl border border-border bg-surface p-5">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-medium">Readiness score</p>
          <p className="text-sm tabular"><span className="font-semibold text-base">{personality.score}</span><span className="text-muted"> / 100</span></p>
        </div>
        <div className="mt-2.5 h-2 rounded-full bg-surface-2 overflow-hidden">
          <div className="h-full rounded-full bg-accent" style={{ width: `${personality.score}%` }} />
        </div>

        <h2 className="mt-6 text-sm font-medium">Where to start</h2>
        <ul className="mt-3 space-y-2.5">
          {personality.tips.map((tip) => (
            <li key={tip} className="flex gap-2.5 text-sm text-foreground-2">
              <Check size={16} className="mt-0.5 shrink-0 text-accent" />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Link href="/dashboard" className={buttonClass('primary', 'lg')}>
          Go to FinScribe <ArrowRight size={16} />
        </Link>
        <Link href="/onboarding/quiz" className={buttonClass('ghost', 'lg')}>Retake</Link>
      </div>
    </Frame>
  )
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col pt-safe pb-safe">
      <header className="h-14 px-4 sm:px-6 flex items-center gap-2">
        <LogoMark size={22} />
        <span className="text-sm font-semibold">FinScribe</span>
      </header>
      <main className="flex-1 w-full max-w-xl mx-auto px-5 pt-10 sm:pt-16 pb-12">{children}</main>
    </div>
  )
}
