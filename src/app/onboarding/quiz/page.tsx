'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { ArrowLeft } from 'lucide-react'
import { LogoMark } from '@/components/Logo'
import { Alert, Button, Spinner, cx } from '@/components/ui'
import { quizQuestions, type QuizAnswers } from '@/lib/onboarding'

export default function QuizPage() {
  const router = useRouter()
  const { isLoaded, user } = useUser()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentQuestion = quizQuestions[currentStep]
  const selectedAnswer = answers[currentQuestion.id]
  const isLast = currentStep === quizQuestions.length - 1

  const submitQuiz = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })
      const data: { error?: string } = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Failed to save your answers.')

      // The server updates Clerk metadata, so refresh the user and session token
      // before navigating to routes that read the new value.
      await user?.reload()
      router.replace('/onboarding/result')
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to save your answers. Please try again.')
      setIsSubmitting(false)
    }
  }

  const handleNext = () => {
    if (!selectedAnswer || isSubmitting) return
    if (!isLast) {
      setCurrentStep((previous) => previous + 1)
      return
    }
    void submitQuiz()
  }

  if (!isLoaded || !user) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col pt-safe">
      <header className="h-14 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LogoMark size={22} />
          <span className="text-sm font-semibold">Set up FinScribe</span>
        </div>
        <span className="text-[13px] text-muted tabular">{currentStep + 1} of {quizQuestions.length}</span>
      </header>
      <div className="h-0.5 bg-border" aria-hidden="true">
        <div
          className="h-full bg-accent transition-[width] duration-300"
          style={{ width: `${((currentStep + 1) / quizQuestions.length) * 100}%` }}
        />
      </div>

      <main className="flex-1 w-full max-w-xl mx-auto px-5 pt-10 sm:pt-16 pb-8">
        <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight leading-tight">
          {currentQuestion.question}
        </h1>
        <p className="mt-2 text-sm text-muted">Choose the one that fits best. You can change this later in Settings.</p>

        <div role="radiogroup" aria-label={currentQuestion.question} className="mt-8 grid gap-2.5">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedAnswer === option
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setAnswers((previous) => ({ ...previous, [currentQuestion.id]: option }))}
                className={cx(
                  'flex items-center gap-3 h-14 px-4 rounded-xl border text-left text-[15px] transition-colors',
                  isSelected
                    ? 'border-accent bg-accent-soft text-foreground'
                    : 'border-border bg-surface hover:border-border-strong',
                )}
              >
                <span
                  className={cx(
                    'h-[18px] w-[18px] rounded-full border-2 shrink-0 flex items-center justify-center',
                    isSelected ? 'border-accent' : 'border-border-strong',
                  )}
                  aria-hidden="true"
                >
                  {isSelected && <span className="h-2 w-2 rounded-full bg-accent" />}
                </span>
                {option}
              </button>
            )
          })}
        </div>

        {error && <div className="mt-6"><Alert>{error}</Alert></div>}
      </main>

      <footer className="sticky bottom-0 border-t border-border bg-background/90 backdrop-blur-md pb-safe">
        <div className="max-w-xl mx-auto px-5 py-3 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => setCurrentStep((previous) => Math.max(0, previous - 1))}
            className={cx(currentStep === 0 && 'invisible')}
          >
            <ArrowLeft size={16} /> Back
          </Button>
          <Button size="lg" onClick={handleNext} disabled={!selectedAnswer} loading={isSubmitting} className="min-w-32">
            {isLast ? 'Finish' : 'Continue'}
          </Button>
        </div>
      </footer>
    </div>
  )
}
