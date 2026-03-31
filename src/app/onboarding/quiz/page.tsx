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


// ─── Helpers ──────────────────────────────────────────────────────────────────

const parseNumber = (val: string | number) => Number(String(val).replace(/[^0-9.]/g, ''));

// ─── Types ───────────────────────────────────────────────────────────────────

export interface OnboardingData {
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

const STEPS = [
  { id: 1, title: "Starting Balance", subtitle: "What's currently in your account?", icon: Wallet },
  { id: 2, title: "Spending Categories", subtitle: "Where does most of your money go?", icon: LayoutGrid },
  { id: 3, title: "Savings Goal", subtitle: "How much do you want to save monthly?", icon: Target },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ currentStep }: { currentStep: number }) {
  const totalSteps = STEPS.length;
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full">
      {/* Step labels */}
      <div className="flex justify-between mb-3">
        {STEPS.map((step) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          return (
            <div key={step.id} className="flex flex-col items-center gap-1" style={{ width: `${100 / totalSteps}%` }}>
              <div
                className={[
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 border",
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
                  "text-[11px] font-medium tracking-wide transition-colors duration-200 hidden sm:block",
                  isActive ? "text-foreground" : "text-muted",
                ].join(" ")}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress track */}
      <div className="relative h-px bg-border mx-4">
        <div
          className="absolute top-0 left-0 h-px bg-accent transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function AmountInput({
  value,
  onChange,
  placeholder,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  id: string;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    onChange(raw);
  };

  const formatted = value
    ? Number(value).toLocaleString("en-IN")
    : "";

  return (
    <div className="relative group">
      {/* Glow ring on focus — via sibling trick */}
      <div className="absolute -inset-px rounded-xl bg-accent/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none" />
      <div className="relative flex items-center rounded-xl border border-border bg-surface group-focus-within:border-accent transition-colors duration-200 overflow-hidden">
        <div className="flex items-center justify-center w-14 h-14 border-r border-border bg-surface shrink-0">
          <IndianRupee className="w-5 h-5 text-accent" />
        </div>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={formatted}
          onChange={handleChange}
          placeholder={placeholder}
          className="flex-1 h-14 px-4 bg-transparent text-foreground text-xl font-medium tracking-tight placeholder:text-muted focus:outline-none"
          autoComplete="off"
        />
      </div>
    </div>
  );
}

function CategoryCard({
  category,
  selected,
  disabled,
  onClick,
}: {
  category: (typeof SPENDING_CATEGORIES)[number];
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = category.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled && !selected}
      aria-pressed={selected}
      className={[
        "relative group flex flex-col items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        selected
          ? "border-accent bg-accent/10 shadow-[0_0_0_1px_rgba(34,197,94,0.3)]"
          : disabled
          ? "border-border bg-surface opacity-40 cursor-not-allowed"
          : "border-border bg-surface hover:border-muted hover:bg-surface/80 cursor-pointer",
      ].join(" ")}
    >
      {/* Selection badge */}
      <div
        className={[
          "absolute top-3 right-3 w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-200",
          selected
            ? "bg-accent border-accent"
            : "border-border bg-transparent",
        ].join(" ")}
      >
        {selected && <Check className="w-3 h-3 text-background" strokeWidth={3} />}
      </div>

      {/* Icon */}
      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center`}>
        <Icon className={`w-4.5 h-4.5 ${category.iconColor}`} />
      </div>

      {/* Label */}
      <span
        className={[
          "text-sm font-medium leading-tight transition-colors duration-150",
          selected ? "text-foreground" : "text-muted",
        ].join(" ")}
      >
        {category.label}
      </span>
    </button>
  );
}

function CompletionScreen({ data, onRestart }: { data: OnboardingData; onRestart: () => void }) {
  return (
    <div className="flex flex-col items-center text-center gap-6 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
          <CheckCircle2 className="w-9 h-9 text-accent" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-background" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          You&apos;re all set!
        </h2>
        <p className="text-sm text-muted max-w-xs leading-relaxed">
          Your workspace is configured. Saving your preferences now...
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OnboardingWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [completedData, setCompletedData] = useState<OnboardingData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Step 1
  const [startingBalance, setStartingBalance] = useState("");
  // Step 2
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  // Step 3
  const [savingsGoal, setSavingsGoal] = useState("");

  const MAX_CATEGORIES = 3;

  const toggleCategory = useCallback((id: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(id)) return prev.filter((c) => c !== id);
      if (prev.length >= MAX_CATEGORIES) return prev;
      return [...prev, id];
    });
  }, []);

  const canProceed = useCallback(() => {
    if (step === 1) return startingBalance !== "" && !isNaN(parseNumber(startingBalance)) && parseNumber(startingBalance) >= 0;
    if (step === 2) return selectedCategories.length === MAX_CATEGORIES;
    if (step === 3) return savingsGoal !== "" && !isNaN(parseNumber(savingsGoal)) && parseNumber(savingsGoal) > 0;
    return false;
  }, [step, startingBalance, selectedCategories, savingsGoal]);

  const onComplete = async (data: OnboardingData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Failed to save preferences.");
      }

      // SUCCESS: Force a hard browser redirect to break out of the Next.js cache/state loop
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);

    } catch (error: unknown) {
      console.error(error);
      // Display error to user, stop loading spinner, but DO NOT reset the step to 1
      setErrorMessage((error as Error).message || "An unexpected error occurred.");
      setIsSubmitting(false);
      setCompleted(false); // Also reset completion state so the form can be retried
    }
  };

  const handleNext = (e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.preventDefault();
    if (!canProceed() || isSubmitting) return;

    setErrorMessage(""); // Clear any previous errors

    if (step < 3) {
      setStep((s) => s + 1);
    } else {
      const data: OnboardingData = {
        startingBalance: parseNumber(startingBalance),
        topCategories: selectedCategories,
        savingsGoal: parseNumber(savingsGoal),
      };
      setCompletedData(data);
      setCompleted(true);
      onComplete(data);
    }
  };

  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const handleRestart = () => {
    setStep(1);
    setCompleted(false);
    setCompletedData(null);
    setStartingBalance("");
    setSelectedCategories([]);
    setSavingsGoal("");
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
              {completed ? "3 / 3" : `${step} / ${STEPS.length}`}
            </span>
          </div>

          {/* Body */}
          <div className="px-6 pt-6 pb-7 space-y-7">
            {completed && completedData ? (
              <CompletionScreen data={completedData} onRestart={handleRestart} />
            ) : (
              <>
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

                {/* Step content */}
                <div
                  key={`content-${step}`}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-400"
                >
                  {step === 1 && (
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

                  {step === 2 && (
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

                  {step === 3 && (
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
                        We&apos;ll track your progress and notify you when you&apos;re on track.
                      </p>
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                    <p className="text-sm text-red-500 text-center">{errorMessage}</p>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center gap-3 pt-1">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center gap-1.5 h-11 px-4 rounded-xl border border-border bg-transparent text-sm font-medium text-muted hover:text-foreground hover:border-muted hover:bg-surface transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
                      "Saving..."
                    ) : step === 3 ? (
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
              </>
            )}
          </div>
        </div>

        {/* Bottom caption */}
        {!completed && (
          <p className="text-center text-xs text-muted mt-4">
            Your data is securely stored and synchronized.
          </p>
        )}
      </div>
    </div>
  );
}
