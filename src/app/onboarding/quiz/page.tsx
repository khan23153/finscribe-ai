"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const QUESTIONS = [
  {
    id: "q1",
    question: "What's your monthly income range?",
    options: ["Under ₹25K", "₹25K–₹50K", "₹50K–₹1L", "Above ₹1L"]
  },
  {
    id: "q2",
    question: "How much do you save each month?",
    options: ["Nothing yet", "Less than 10%", "10–30%", "More than 30%"]
  },
  {
    id: "q3",
    question: "What's your biggest spending category?",
    options: ["Food & Dining", "Shopping", "Travel", "Bills & EMIs"]
  },
  {
    id: "q4",
    question: "Do you track your expenses?",
    options: ["Never", "Occasionally", "Weekly", "Daily"]
  },
  {
    id: "q5",
    question: "What's your primary financial goal?",
    options: ["Emergency Fund", "Debt Freedom", "Wealth Building", "Retirement"]
  }
];

export default function QuizPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>;
  if (!isSignedIn) {
    router.push("/sign-in");
    return null;
  }

  const handleNext = () => {
    if (!selectedOption) return;

    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
      setSelectedOption(null);
    } else {
      // Finished
      sessionStorage.setItem("quizAnswers", JSON.stringify(newAnswers));
      router.push("/onboarding/result");
    }
  };

  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;
  const currentQ = QUESTIONS[currentStep];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Progress Bar */}
      <div className="h-1 w-full bg-surface">
        <div
          className="h-full bg-accent transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="absolute top-8 left-8 text-muted font-mono text-sm">
          {currentStep + 1} / {QUESTIONS.length}
        </div>

        <div className="max-w-2xl w-full bg-surface border border-border p-8 rounded-2xl shadow-xl">
          <h2 className="font-display text-3xl font-bold mb-8 text-center leading-tight">
            {currentQ.question}
          </h2>

          <div className="grid gap-4 mb-8">
            {currentQ.options.map((opt, i) => {
              const isSelected = selectedOption === opt;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedOption(opt)}
                  className={`p-4 text-left rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? "border-accent bg-accent-glow"
                      : "border-border hover:border-accent hover:bg-surface/50 bg-background"
                  }`}
                >
                  <div className="font-medium text-lg">{opt}</div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-end">
            {selectedOption ? (
              <button
                onClick={handleNext}
                className="bg-accent hover:bg-accent-dark text-background px-8 py-3 rounded-full font-bold text-lg transition-colors flex items-center gap-2"
              >
                {currentStep === QUESTIONS.length - 1 ? "See Results" : "Next"} &rarr;
              </button>
            ) : (
              <div className="px-8 py-3 rounded-full font-bold text-lg text-muted/50 cursor-not-allowed">
                {currentStep === QUESTIONS.length - 1 ? "See Results" : "Next"} &rarr;
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
