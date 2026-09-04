import { z } from 'zod'

export const goalOptions = [
  'Track daily expenses',
  'Save for a big purchase',
  'Pay off debt',
  'Invest for the future',
] as const

export const experienceOptions = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert',
] as const

export const incomeTypeOptions = [
  'Salary',
  'Freelance / Business',
  'Investments',
  'Other',
] as const

export const spendingHabitOptions = [
  'Food & Dining',
  'Shopping',
  'Housing & Utilities',
  'Travel',
] as const

export const notificationOptions = [
  'Daily',
  'Weekly',
  'Monthly',
  'Rarely',
] as const

export const quizAnswersSchema = z.object({
  goal: z.enum(goalOptions),
  experience: z.enum(experienceOptions),
  income_type: z.enum(incomeTypeOptions),
  spending_habit: z.enum(spendingHabitOptions),
  notification: z.enum(notificationOptions),
}).strict()

export type QuizAnswers = z.infer<typeof quizAnswersSchema>

export const quizQuestions: ReadonlyArray<{
  id: keyof QuizAnswers
  question: string
  options: readonly string[]
}> = [
  {
    id: 'goal',
    question: "What's your primary financial goal?",
    options: goalOptions,
  },
  {
    id: 'experience',
    question: 'How would you rate your financial knowledge?',
    options: experienceOptions,
  },
  {
    id: 'income_type',
    question: 'What is your primary source of income?',
    options: incomeTypeOptions,
  },
  {
    id: 'spending_habit',
    question: "What's your biggest spending category usually?",
    options: spendingHabitOptions,
  },
  {
    id: 'notification',
    question: 'How often do you want to review your finances?',
    options: notificationOptions,
  },
]

export type FinancialPersonality = {
  name: string
  emoji: string
  description: string
  score: number
  tips: string[]
}

export function getFinancialPersonality(
  answers: QuizAnswers,
): FinancialPersonality {
  const reviewsOften = answers.notification === 'Daily' || answers.notification === 'Weekly'
  const isExperienced = answers.experience === 'Advanced' || answers.experience === 'Expert'

  if (answers.goal === 'Track daily expenses' && reviewsOften) {
    return {
      name: 'The Optimizer',
      emoji: '🎯',
      score: 85,
      description: 'You value visibility and regular course corrections in your finances.',
      tips: [
        'Review category totals at the same time each week.',
        'Automate transfers immediately after income arrives.',
        'Set a specific limit for the category that varies most.',
      ],
    }
  }

  if (answers.goal === 'Invest for the future' || isExperienced) {
    return {
      name: 'The Strategist',
      emoji: '📊',
      score: 76,
      description: 'You think ahead and prefer decisions that support long-term growth.',
      tips: [
        'Keep an emergency fund before increasing investment risk.',
        'Review asset allocation on a fixed schedule, not after market swings.',
        'Track fees and taxes alongside headline returns.',
      ],
    }
  }

  if (answers.spending_habit === 'Shopping' || answers.spending_habit === 'Travel') {
    return {
      name: 'The Explorer',
      emoji: '🌍',
      score: 58,
      description: 'You value experiences and flexibility, so lightweight guardrails work best.',
      tips: [
        `Start by setting a weekly cap for ${answers.spending_habit}.`,
        'Use a 24-hour pause before non-essential purchases.',
        'Move a small fixed amount to savings on every payday.',
      ],
    }
  }

  return {
    name: 'The Builder',
    emoji: '🏗️',
    score: 67,
    description: 'You are building a practical foundation and benefit from clear milestones.',
    tips: [
      answers.goal === 'Pay off debt'
        ? 'Prioritize the highest-interest debt while paying every minimum on time.'
        : 'Build an emergency fund in small, repeatable steps.',
      'Track essential and discretionary spending separately.',
      'Increase savings when income rises instead of expanding every expense.',
    ],
  }
}
