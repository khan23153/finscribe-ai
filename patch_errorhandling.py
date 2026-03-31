import re

with open("src/app/onboarding/quiz/page.tsx", "r") as f:
    content = f.read()

old_code = """      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save preferences.");
      }"""

new_code = """      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Failed to save preferences.");
      }"""

if old_code in content:
    content = content.replace(old_code, new_code)

    with open("src/app/onboarding/quiz/page.tsx", "w") as f:
        f.write(content)
    print("Patch applied successfully")
else:
    print("Could not find code block to replace")
