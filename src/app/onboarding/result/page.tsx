'use client'

import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { getFinancialPersonality, quizAnswersSchema } from '@/lib/onboarding'

export default function ResultPage() {
  const { isLoaded, user } = useUser()

  if (!isLoaded) {
    return <LoadingState />
  }

  const parsedAnswers = quizAnswersSchema.safeParse(user?.publicMetadata.quizAnswers)

  if (!parsedAnswers.success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-lg w-full bg-surface border border-border p-8 rounded-2xl text-center">
          <h1 className="font-display text-3xl font-bold mb-3">No quiz result yet</h1>
          <p className="text-muted mb-6">
            Complete the financial quiz to generate a personalized starting plan.
          </p>
          <Link
            href="/onboarding/quiz"
            className="inline-flex bg-accent hover:bg-accent-dark text-background px-7 py-3 rounded-full font-bold"
          >
            Take the quiz
          </Link>
        </div>
      </div>
    )
  }

  const personality = getFinancialPersonality(parsedAnswers.data)

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-2xl w-full bg-surface border border-border p-8 md:p-12 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-accent-glow rounded-full blur-3xl pointer-events-none" />

        <div className="text-center relative z-10">
          <div className="text-7xl mb-4" aria-hidden="true">{personality.emoji}</div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {personality.name}
          </h1>
          <p className="text-muted text-lg mb-8 max-w-md mx-auto">
            {personality.description}
          </p>

          <div className="bg-background/50 border border-border rounded-xl p-6 mb-8 text-left">
            <h2 className="font-display font-bold text-xl mb-4">Personalized action plan</h2>
            <ul className="space-y-3">
              {personality.tips.map((tip) => (
                <li key={tip} className="flex items-start gap-3">
                  <span className="text-accent mt-1 bg-accent/10 p-1 rounded-full" aria-hidden="true">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-muted">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-10 text-left">
            <div className="flex justify-between items-end mb-2">
              <span className="font-display font-bold">Financial readiness score</span>
              <span className="font-mono font-bold text-accent text-xl">
                {personality.score}/100
              </span>
            </div>
            <div className="h-3 w-full bg-background rounded-full overflow-hidden border border-border">
              <div
                className="h-full bg-accent"
                style={{ width: `${personality.score}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="bg-accent hover:bg-accent-dark text-background px-8 py-3 rounded-full font-bold text-lg transition-colors w-full sm:w-auto"
            >
              Go to Dashboard &rarr;
            </Link>
            <Link
              href="/onboarding/quiz"
              className="px-8 py-3 rounded-full font-bold text-lg hover:bg-background border border-border transition-colors w-full sm:w-auto"
            >
              Retake Quiz
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
