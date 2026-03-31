import re

with open("src/app/onboarding/quiz/page.tsx", "r") as f:
    content = f.read()

old_code = """  const canProceed = useCallback(() => {
    if (step === 1) return startingBalance !== "" && Number(startingBalance) >= 0;
    if (step === 2) return selectedCategories.length === MAX_CATEGORIES;
    if (step === 3) return savingsGoal !== "" && Number(savingsGoal) > 0;
    return false;
  }, [step, startingBalance, selectedCategories, savingsGoal]);"""

new_code = """  const canProceed = useCallback(() => {
    if (step === 1) return startingBalance !== "" && !isNaN(parseNumber(startingBalance)) && parseNumber(startingBalance) >= 0;
    if (step === 2) return selectedCategories.length === MAX_CATEGORIES;
    if (step === 3) return savingsGoal !== "" && !isNaN(parseNumber(savingsGoal)) && parseNumber(savingsGoal) > 0;
    return false;
  }, [step, startingBalance, selectedCategories, savingsGoal]);"""

if old_code in content:
    content = content.replace(old_code, new_code)

    with open("src/app/onboarding/quiz/page.tsx", "w") as f:
        f.write(content)
    print("Patch applied successfully")
else:
    print("Could not find code block to replace")
