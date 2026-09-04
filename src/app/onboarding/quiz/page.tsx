'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { ArrowRight, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react'
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

  const handleOptionSelect = (option: string) => {
    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]: option,
    }))
  }

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

      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to save onboarding data.')
      }

      // The server updates Clerk metadata, so refresh the user and session token
      // before navigating to routes that read the new value.
      await user?.reload()
      router.replace('/onboarding/result')
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Failed to save preferences. Please try again.',
      )
      setIsSubmitting(false)
    }
  }

  const handleNext = () => {
    if (!selectedAnswer || isSubmitting) return

    if (currentStep < quizQuestions.length - 1) {
      setCurrentStep((previous) => previous + 1)
      return
    }

    void submitQuiz()
  }

  if (!isLoaded || !user || isSubmitting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 p-6">
        <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
        <h2 className="text-2xl font-bold mb-2">
          {isSubmitting ? 'Optimizing your account...' : 'Loading your account...'}
        </h2>
        <p className="text-zinc-400 text-center max-w-md">
          {isSubmitting
            ? 'We are setting up your dashboard based on your preferences.'
            : 'This will only take a moment.'}
        </p>
      </div>
    )
  }

  const progress = ((currentStep + 1) / quizQuestions.length) * 100

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 p-6">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <div className="flex justify-between text-sm font-medium text-zinc-400 mb-2">
            <span>Question {currentStep + 1} of {quizQuestions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-accent h-full transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-8 tracking-tight">
          {currentQuestion.question}
        </h1>

        <div className="grid gap-4 mb-8">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedAnswer === option

            return (
              <button
                key={option}
                type="button"
                onClick={() => handleOptionSelect(option)}
                className={`flex items-center justify-between p-6 rounded-xl border-2 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-accent bg-accent/10'
                    : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700 hover:bg-zinc-800'
                }`}
              >
                <span className="text-lg font-medium">{option}</span>
                {isSelected && <CheckCircle2 className="w-6 h-6 text-accent" />}
              </button>
            )
          })}
        </div>

        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setCurrentStep((previous) => Math.max(0, previous - 1))}
            disabled={currentStep === 0}
            className="px-5 py-4 rounded-xl font-semibold text-zinc-400 hover:text-white disabled:opacity-0 disabled:pointer-events-none"
          >
            Back
          </button>

          <div className="flex flex-col items-end gap-3">
            {error && (
              <p role="alert" className="text-red-400 bg-red-500/10 px-4 py-2 rounded-lg font-medium">
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={!selectedAnswer || isSubmitting}
              className={`flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all duration-200 ${
                selectedAnswer
                  ? 'bg-zinc-100 text-zinc-900 hover:bg-white hover:scale-105'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              <span>
                {currentStep === quizQuestions.length - 1 ? 'Complete Setup' : 'Continue'}
              </span>
              {currentStep === quizQuestions.length - 1 ? (
                <ArrowRight className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
