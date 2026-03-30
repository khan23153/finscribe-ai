"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export default function ResultPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  const [personality, setPersonality] = useState<{name: string, emoji: string, desc: string, score: number, tips: string[]} | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    const answersStr = sessionStorage.getItem("quizAnswers");
    if (!answersStr) {
      router.push("/onboarding/quiz");
      return;
    }

    const answers: string[] = JSON.parse(answersStr);

    // Logic (simple scoring)
    let saveCount = 0;
    let spendCount = 0;
    let trackCount = 0;
    let buildCount = 0;

    // Q2: Savings
    if (answers[1].includes("10-30%") || answers[1].includes("More than 30%")) saveCount++;
    if (answers[1].includes("Nothing")) spendCount++;

    // Q3: Category
    if (answers[2].includes("Food") || answers[2].includes("Shopping")) spendCount++;
    if (answers[2].includes("Travel")) spendCount++;
    if (answers[2].includes("Bills")) buildCount++;

    // Q4: Track
    if (answers[3].includes("Weekly") || answers[3].includes("Daily")) trackCount++;
    if (answers[3].includes("Never")) spendCount++;

    // Q5: Goal
    if (answers[4].includes("Emergency") || answers[4].includes("Debt")) saveCount++;
    if (answers[4].includes("Wealth") || answers[4].includes("Retirement")) buildCount++;

    let result;
    if (trackCount >= 1 && saveCount >= 1) {
      result = {
        name: "The Optimizer",
        emoji: "🎯",
        score: 85,
        desc: "You are highly disciplined and focused on efficiency. You track where your money goes and save diligently.",
        tips: [
          "Automate your investments to take advantage of compound interest.",
          "Review your subscriptions monthly to cut unused services.",
          "Set a specific date each month to review your entire portfolio."
        ]
      };
    } else if (spendCount > saveCount) {
      result = {
        name: "The Explorer",
        emoji: "🌍",
        score: 45,
        desc: "You love experiences and living in the moment. Budgeting isn't your favorite activity, but you enjoy your purchases.",
        tips: [
          "Start small by tracking just one category, like Food & Dining.",
          "Set up an automatic 10% transfer to a savings account on payday.",
          "Implement a 24-hour waiting period for non-essential purchases."
        ]
      };
    } else if (buildCount >= 1 && saveCount === spendCount) {
      result = {
        name: "The Strategist",
        emoji: "📊",
        score: 70,
        desc: "You balance enjoyment today with security for tomorrow. You have goals but allow yourself flexibility.",
        tips: [
          "Use the 50/30/20 rule to structure your budget effortlessly.",
          "Look for credit cards that offer rewards on your most common expenses.",
          "Increase your emergency fund target by 1 month of expenses."
        ]
      };
    } else {
      result = {
        name: "The Builder",
        emoji: "🏗️",
        score: 65,
        desc: "You are laying the foundation for wealth. You might be early in your journey or focused on growing your income.",
        tips: [
          "Focus on paying down high-interest debt first.",
          "Invest in skills that can increase your earning potential.",
          "Build a starter emergency fund of ₹25,000 immediately."
        ]
      };
    }

    setPersonality(result);
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !personality) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-2xl w-full bg-surface border border-border p-8 md:p-12 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Glow behind the emoji */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-accent-glow rounded-full blur-3xl pointer-events-none" />

        <div className="text-center relative z-10">
          <div className="text-7xl mb-4 animate-bounce">{personality.emoji}</div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {personality.name}
          </h1>
          <p className="text-muted text-lg mb-8 max-w-md mx-auto">
            {personality.desc}
          </p>

          <div className="bg-background/50 border border-border rounded-xl p-6 mb-8 text-left">
            <h3 className="font-display font-bold text-xl mb-4">Personalized Action Plan:</h3>
            <ul className="space-y-3">
              {personality.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-accent mt-1 bg-accent/10 p-1 rounded-full">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-muted-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-10 text-left">
            <div className="flex justify-between items-end mb-2">
              <span className="font-display font-bold">Financial Health Score</span>
              <span className="font-mono font-bold text-accent text-xl">{personality.score}/100</span>
            </div>
            <div className="h-3 w-full bg-background rounded-full overflow-hidden border border-border">
              <div
                className="h-full bg-accent relative"
                style={{
                  width: `${personality.score}%`,
                  transition: 'width 1.5s cubic-bezier(0.22, 1, 0.36, 1) 0.5s'
                }}
              >
                <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/20 animate-pulse" />
              </div>
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
  );
}
