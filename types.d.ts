export {}
declare global {
  interface CustomJwtSessionClaims {
    metadata?: {
      onboardingComplete?: boolean;
    };
    publicMetadata?: {
      onboardingComplete?: boolean;
      topCategories?: string[];
      savingsGoal?: number;
    };
  }
}
