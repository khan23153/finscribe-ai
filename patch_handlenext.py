import re

with open("src/app/onboarding/quiz/page.tsx", "r") as f:
    content = f.read()

old_code = """      const data: OnboardingData = {
        startingBalance: Number(startingBalance),
        topCategories: selectedCategories,
        savingsGoal: Number(savingsGoal),
      };"""

new_code = """      const data: OnboardingData = {
        startingBalance: parseNumber(startingBalance),
        topCategories: selectedCategories,
        savingsGoal: parseNumber(savingsGoal),
      };"""

if old_code in content:
    content = content.replace(old_code, new_code)

    with open("src/app/onboarding/quiz/page.tsx", "w") as f:
        f.write(content)
    print("Patch applied successfully")
else:
    print("Could not find code block to replace")
