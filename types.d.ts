import { CustomJwtSessionClaims } from "@clerk/types";

declare global {
  interface CustomJwtSessionClaims {
    publicMetadata: {
      onboardingComplete?: boolean;
      topCategories?: string[];
      savingsGoal?: number;
    };
  }
}
