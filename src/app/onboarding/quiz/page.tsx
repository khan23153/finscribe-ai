"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  IndianRupee,
  ShoppingCart,
  Bus,
  ShoppingBag,
  Receipt,
  Tv,
  HeartPulse,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Wallet,
  Target,
  LayoutGrid,
  Check,
  Sparkles,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface OnboardingData {
  incomeRange: string;
  savingsPercentage: string;
  topSpending: string;
  expenseTracking: string;
  primaryGoal: string;
  startingBalance: number;
  topCategories: string[];
  savingsGoal: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SPENDING_CATEGORIES = [
  { id: "Food & Dining", label: "Food & Dining", icon: ShoppingCart, color: "from-orange-500/20 to-orange-600/10", iconColor: "text-orange-400" },
  { id: "Transport", label: "Transport", icon: Bus, color: "from-blue-500/20 to-blue-600/10", iconColor: "text-blue-400" },
  { id: "Shopping", label: "Shopping", icon: ShoppingBag, color: "from-pink-500/20 to-pink-600/10", iconColor: "text-pink-400" },
  { id: "Bills & Utilities", label: "Bills & Utilities", icon: Receipt, color: "from-yellow-500/20 to-yellow-600/10", iconColor: "text-yellow-400" },
  { id: "Entertainment", label: "Entertainment", icon: Tv, color: "from-purple-500/20 to-purple-600/10", iconColor: "text-purple-400" },
  { id: "Health & Fitness", label: "Health & Fitness", icon: HeartPulse, color: "from-green-500/20 to-green-600/10", iconColor: "text-green-400" },
] as const;

const QUESTIONS = [
  {
    id: "q1",
    options: ["Under ₹25K", "₹25K–₹50K", "₹50K–₹1L", "Above ₹1L"]
  },
  {
    id: "q2",
    options: ["Nothing yet", "Less than 10%", "10–30%", "More than 30%"]
  },
  {
    id: "q3",
    options: ["Food & Dining", "Shopping", "Travel", "Bills & EMIs"]
  },
  {
    id: "q4",
    options: ["Never", "Occasionally", "Weekly", "Daily"]
  },
  {
    id: "q5",
    options: ["Emergency Fund", "Debt Freedom", "Wealth Building", "Retirement"]
  }
];

const STEPS = [
  { id: 1, title: "Income Range", subtitle: "What's your monthly income range?", icon: Wallet },
  { id: 2, title: "Savings Habit", subtitle: "How much do you save each month?", icon: Target },
  { id: 3, title: "Biggest Spend", subtitle: "What's your biggest spending category?", icon: ShoppingCart },
  { id: 4, title: "Expense Tracking", subtitle: "Do you track your expenses?", icon: LayoutGrid },
  { id: 5, title: "Primary Goal", subtitle: "What's your primary financial goal?", icon: Target },
  { id: 6, title: "Starting Balance", subtitle: "What's currently in your account?", icon: Wallet },
  { id: 7, title: "Spending Categories", subtitle: "Where does most of your money go?", icon: LayoutGrid },
  { id: 8, title: "Savings Goal", subtitle: "How much do you want to save monthly?", icon: Target },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ currentStep }: { currentStep: number }) {
  const totalSteps = STEPS.length;
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full">
      {/* Step labels */}
      <div className="flex justify-between mb-3 overflow-x-auto pb-2 scrollbar-hide">
        {STEPS.map((step) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          return (
            <div key={step.id} className="flex flex-col items-center gap-1 min-w-[40px] px-1">
              <div
                className={[
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 border flex-shrink-0",
                  isCompleted
                    ? "bg-accent border-accent text-background"
                    : isActive
                    ? "border-accent text-accent bg-accent/10"
                    : "border-border text-muted bg-transparent",
                ].join(" ")}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> : step.id}
              </div>
              <span
                className={[
                  "text-[9px] font-medium tracking-wide transition-colors duration-200 hidden sm:block text-center whitespace-nowrap",
                  isActive ? "text-foreground" : "text-muted",
                ].join(" ")}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="relative h-1.5 w-full bg-surface border border-border rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-accent transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function AmountInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <IndianRupee className="w-5 h-5 text-muted group-focus-within:text-accent transition-colors" />
      </div>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={(e) => {
          const val = e.target.value.replace(/[^0-9]/g, "");
          onChange(val);
        }}
        placeholder={placeholder}
        className="w-full h-14 pl-11 pr-4 bg-background border border-border rounded-xl text-lg font-medium text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all shadow-sm"
      />
    </div>
  );
}

function CategoryCard({
  category,
  selected,
  disabled,
  onClick,
}: {
  category: typeof SPENDING_CATEGORIES[number];
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = category.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!selected && disabled}
      className={[
        "relative p-4 rounded-xl text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        selected
          ? "bg-accent/10 border-2 border-accent shadow-sm"
          : "bg-background border-2 border-border hover:border-muted hover:bg-surface disabled:opacity-50 disabled:hover:border-border disabled:hover:bg-background disabled:cursor-not-allowed",
      ].join(" ")}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={[
            "w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br",
            category.color,
          ].join(" ")}
        >
          <Icon className={["w-5 h-5", category.iconColor].join(" ")} />
        </div>
        {selected && <CheckCircle2 className="w-5 h-5 text-accent" />}
      </div>
      <span
        className={[
          "block text-sm font-semibold tracking-tight",
          selected ? "text-foreground" : "text-muted",
        ].join(" ")}
      >
        {category.label}
      </span>
    </button>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

export default function OnboardingWizard() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Q1-Q5 state
  const [answers, setAnswers] = useState<string[]>([]);

  // Q6-Q8 state
  const [startingBalance, setStartingBalance] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [savingsGoal, setSavingsGoal] = useState("");

  const MAX_CATEGORIES = 3;

  const toggleCategory = useCallback(
    (id: string) => {
      setSelectedCategories((prev) => {
        if (prev.includes(id)) return prev.filter((c) => c !== id);
        if (prev.length >= MAX_CATEGORIES) return prev;
        return [...prev, id];
      });
    },
    []
  );

  const canProceed = () => {
    if (step >= 1 && step <= 5) {
      return answers[step - 1] !== undefined;
    }
    if (step === 6) return startingBalance.length > 0;
    if (step === 7) return selectedCategories.length === MAX_CATEGORIES;
    if (step === 8) return savingsGoal.length > 0;
    return false;
  };

  const handleNext = async () => {
    if (!canProceed() || isSubmitting) return;

    if (step < STEPS.length) {
      setStep((s) => s + 1);
      setErrorMsg(null);
    } else {
      // Final step -> Submit
      try {
        setIsSubmitting(true);
        setErrorMsg(null);

        const data: OnboardingData = {
          incomeRange: answers[0],
          savingsPercentage: answers[1],
          topSpending: answers[2],
          expenseTracking: answers[3],
          primaryGoal: answers[4],
          startingBalance: Number(startingBalance),
          topCategories: selectedCategories,
          savingsGoal: Number(savingsGoal),
        };

        // Also save quizAnswers for the result page to use
        sessionStorage.setItem("quizAnswers", JSON.stringify(answers));

        const response = await fetch('/api/onboarding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const resData = await response.json();
          setErrorMsg(resData.error || 'Failed to save onboarding data');
          setIsSubmitting(false);
        } else {
          router.refresh();
          router.push('/dashboard');
        }
      } catch (error: any) {
        console.error('Error saving onboarding data:', error);
        setErrorMsg(error.message || 'An unexpected error occurred');
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    setStep((s) => Math.max(1, s - 1));
  };

  const currentStepMeta = STEPS[step - 1];
  const StepIcon = currentStepMeta ? currentStepMeta.icon : Target;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 font-body">
      {/* Ambient background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg">
        {/* Card */}
        <div className="rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden">
          {/* Header bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
                <IndianRupee className="w-3.5 h-3.5 text-background" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-semibold text-foreground tracking-tight">FinFlow Setup</span>
            </div>
            <span className="text-xs text-muted font-mono">
              {step} / {STEPS.length}
            </span>
          </div>

          {/* Body */}
          <div className="px-6 pt-6 pb-7 space-y-7">
            {/* Step indicator */}
            <StepIndicator currentStep={step} />

            {/* Step heading */}
            <div
              key={step}
              className="space-y-1 animate-in fade-in slide-in-from-bottom-3 duration-300"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <StepIcon className="w-4 h-4 text-accent" />
                </div>
                <span className="text-xs font-medium text-accent tracking-widest uppercase">
                  Step {step}
                </span>
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground text-balance font-display">
                {currentStepMeta.title}
              </h1>
              <p className="text-sm text-muted leading-relaxed">
                {currentStepMeta.subtitle}
              </p>
            </div>

            {errorMsg && (
              <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg flex items-start gap-2 border border-destructive/20 animate-in fade-in">
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Step content */}
            <div
              key={`content-${step}`}
              className="animate-in fade-in slide-in-from-bottom-2 duration-400"
            >
              {step >= 1 && step <= 5 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {QUESTIONS[step - 1].options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          const newAnswers = [...answers];
                          newAnswers[step - 1] = opt;
                          setAnswers(newAnswers);
                        }}
                        className={[
                          "p-4 rounded-xl text-left text-sm font-medium transition-all duration-200 border-2",
                          answers[step - 1] === opt
                            ? "bg-accent/10 border-accent text-foreground shadow-sm"
                            : "bg-background border-border text-muted hover:border-muted hover:bg-surface"
                        ].join(" ")}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-3">
                  <label htmlFor="balance" className="sr-only">
                    Starting balance in rupees
                  </label>
                  <AmountInput
                    id="balance"
                    value={startingBalance}
                    onChange={setStartingBalance}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted pl-1">
                    This helps us give you accurate insights from day one.
                  </p>
                </div>
              )}

              {step === 7 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    {SPENDING_CATEGORIES.map((cat) => (
                      <CategoryCard
                        key={cat.id}
                        category={cat}
                        selected={selectedCategories.includes(cat.id)}
                        disabled={selectedCategories.length >= MAX_CATEGORIES}
                        onClick={() => toggleCategory(cat.id)}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-muted">
                      Select exactly {MAX_CATEGORIES} categories
                    </p>
                    <span
                      className={[
                        "text-xs font-semibold tabular-nums transition-colors duration-200",
                        selectedCategories.length === MAX_CATEGORIES
                          ? "text-accent"
                          : "text-muted",
                      ].join(" ")}
                    >
                      {selectedCategories.length} / {MAX_CATEGORIES}
                    </span>
                  </div>
                </div>
              )}

              {step === 8 && (
                <div className="space-y-3">
                  <label htmlFor="goal" className="sr-only">
                    Monthly savings goal in rupees
                  </label>
                  <AmountInput
                    id="goal"
                    value={savingsGoal}
                    onChange={setSavingsGoal}
                    placeholder="5,000"
                  />
                  {savingsGoal && startingBalance && Number(savingsGoal) > 0 && (
                    <div className="rounded-lg border border-border bg-background px-4 py-3 flex items-center justify-between">
                      <span className="text-xs text-muted">Savings rate</span>
                      <span className="text-sm font-semibold text-accent tabular-nums">
                        {Math.min(
                          100,
                          Math.round((Number(savingsGoal) / Math.max(Number(startingBalance), 1)) * 100)
                        )}
                        %
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-muted pl-1">
                    We'll track your progress and notify you when you're on track.
                  </p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-3 pt-1">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 h-11 px-4 rounded-xl border border-border bg-transparent text-sm font-medium text-muted hover:text-foreground hover:border-muted hover:bg-surface transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed() || isSubmitting}
                className={[
                  "flex items-center justify-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold transition-all duration-200 flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  canProceed() && !isSubmitting
                    ? "bg-foreground text-background hover:bg-foreground/90 shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
                    : "bg-surface border border-border text-muted cursor-not-allowed",
                ].join(" ")}
              >
                {isSubmitting ? (
                  "Saving preferences..."
                ) : step === STEPS.length ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Complete Setup
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom caption */}
        <p className="text-center text-xs text-muted mt-4">
          Your data is securely stored and synchronized.
        </p>
      </div>
    </div>
  );
}
