import re

with open("src/app/onboarding/quiz/page.tsx", "r") as f:
    content = f.read()

old_code = "} catch (error: Error | any) {"
new_code = "} catch (error: unknown) {"

old_message = 'setErrorMessage(error.message || "An unexpected error occurred.");'
new_message = 'setErrorMessage((error as Error).message || "An unexpected error occurred.");'

if old_code in content:
    content = content.replace(old_code, new_code)
    content = content.replace(old_message, new_message)
    with open("src/app/onboarding/quiz/page.tsx", "w") as f:
        f.write(content)
    print("Fixed page.tsx")
