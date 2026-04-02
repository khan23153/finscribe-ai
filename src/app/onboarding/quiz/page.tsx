"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import { useUser, useAuth } from "@clerk/nextjs";

const QUIZ_QUESTIONS = [
  {
    id: "goal",
    question: "What's your primary financial goal?",
    options: [
      "Track daily expenses",
      "Save for a big purchase",
      "Pay off debt",
      "Invest for the future",
    ],
  },
  {
    id: "experience",
    question: "How would you rate your financial knowledge?",
    options: ["Beginner", "Intermediate", "Advanced", "Expert"],
  },
  {
    id: "income_type",
    question: "What is your primary source of income?",
    options: ["Salary", "Freelance / Business", "Investments", "Other"],
  },
  {
    id: "spending_habit",
    question: "What's your biggest spending category usually?",
    options: ["Food & Dining", "Shopping", "Housing & Utilities", "Travel"],
  },
  {
    id: "notification",
    question: "How often do you want to review your finances?",
    options: ["Daily", "Weekly", "Monthly", "Rarely"],
  },
];

export default function QuizPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const { getToken } = useAuth();

  const handleOptionSelect = (option: string) => {
    setAnswers((prev) => ({
      ...prev,
      [QUIZ_QUESTIONS[currentStep].id]: option,
    }));
  };

  const handleNext = async () => {
    if (currentStep < QUIZ_QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      await submitQuiz();
    }
  };

  const submitQuiz = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      });

      if (response.ok) {
        // Isolate the token refresh so it doesn't trigger the main error UI if it hiccups
        try {
          if (user) await user.reload();
          // CRITICAL: Force Clerk to fetch a new JWT token with updated session claims
          await getToken({ skipCache: true });
        } catch (reloadError) {
          console.error("Failed to refresh Clerk session/token:", reloadError);
        }

        // Now the session token is fresh. The middleware will read onboardingComplete: true
        window.location.href = '/dashboard';
        return;
      }

      throw new Error("Failed to save onboarding data");
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setError("Failed to save preferences. Please try again.");
    }
  };

  if (isSubmitting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 p-6">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <h2 className="text-2xl font-bold mb-2">Optimizing your account...</h2>
        <p className="text-zinc-400 text-center max-w-md">
          We are setting up your smart dashboard based on your preferences.
        </p>
      </div>
    );
  }

  const currentQuestion = QUIZ_QUESTIONS[currentStep];
  const hasAnsweredCurrent = !!answers[currentQuestion.id];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 p-6">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm font-medium text-zinc-400 mb-2">
            <span>Question {currentStep + 1} of {QUIZ_QUESTIONS.length}</span>
            <span>{Math.round(((currentStep + 1) / QUIZ_QUESTIONS.length) * 100)}%</span>
          </div>
          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-300 ease-in-out"
              style={{ width: `${((currentStep + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <h1 className="text-3xl md:text-4xl font-bold mb-8 tracking-tight">
          {currentQuestion.question}
        </h1>

        {/* Options */}
        <div className="grid gap-4 mb-8">
          {currentQuestion.options.map((option) => {
            const isSelected = answers[currentQuestion.id] === option;
            return (
              <button
                key={option}
                onClick={() => handleOptionSelect(option)}
                className={`flex items-center justify-between p-6 rounded-xl border-2 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-zinc-800 bg-zinc-900 hover:border-zinc-700 hover:bg-zinc-800"
                }`}
              >
                <span className="text-lg font-medium">{option}</span>
                {isSelected && <CheckCircle2 className="w-6 h-6 text-blue-500" />}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end gap-4">
          {error && (
            <div className="text-red-500 bg-red-500/10 px-4 py-2 rounded-lg font-medium">
              {error}
            </div>
          )}
          <button
            onClick={handleNext}
            disabled={!hasAnsweredCurrent}
            className={`flex items-center space-x-2 px-8 py-4 rounded-xl font-semibold transition-all duration-200 ${
              hasAnsweredCurrent
                ? "bg-zinc-100 text-zinc-900 hover:bg-white hover:scale-105"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            }`}
          >
            <span>{currentStep === QUIZ_QUESTIONS.length - 1 ? "Complete Setup" : "Continue"}</span>
            {currentStep === QUIZ_QUESTIONS.length - 1 ? (
              <ArrowRight className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
