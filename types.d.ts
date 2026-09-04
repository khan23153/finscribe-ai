import type { QuizAnswers } from './src/lib/onboarding'

export {}

declare global {
  interface UserPublicMetadata {
    onboardingComplete?: boolean
    quizAnswers?: QuizAnswers
  }

  interface CustomJwtSessionClaims {
    metadata?: {
      onboardingComplete?: boolean;
    };
  }
}
