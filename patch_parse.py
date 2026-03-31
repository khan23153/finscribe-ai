import re

with open("src/app/onboarding/quiz/page.tsx", "r") as f:
    content = f.read()

helper = """
// ─── Helpers ──────────────────────────────────────────────────────────────────

const parseNumber = (val: string | number) => Number(String(val).replace(/[^0-9.]/g, ''));
"""

if "// ─── Types ───────────────────────────────────────────────────────────────────" in content:
    content = content.replace(
        "// ─── Types ───────────────────────────────────────────────────────────────────",
        helper + "\n// ─── Types ───────────────────────────────────────────────────────────────────"
    )

    with open("src/app/onboarding/quiz/page.tsx", "w") as f:
        f.write(content)
    print("Patch applied successfully")
else:
    print("Could not find insertion point")
