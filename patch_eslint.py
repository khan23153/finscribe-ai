import re

# Fix topCategories in route.ts
with open("src/app/api/onboarding/route.ts", "r") as f:
    content = f.read()

old_code = """    let { startingBalance, topCategories, savingsGoal } = data;"""
new_code = """    let { startingBalance, savingsGoal } = data;
    const { topCategories } = data;"""

if old_code in content:
    content = content.replace(old_code, new_code)
    with open("src/app/api/onboarding/route.ts", "w") as f:
        f.write(content)
    print("Fixed route.ts")

# Fix error: any in page.tsx
with open("src/app/onboarding/quiz/page.tsx", "r") as f:
    content = f.read()

old_code = "} catch (error: any) {"
new_code = "} catch (error: Error | any) {"

if old_code in content:
    content = content.replace(old_code, new_code)
    with open("src/app/onboarding/quiz/page.tsx", "w") as f:
        f.write(content)
    print("Fixed page.tsx")
