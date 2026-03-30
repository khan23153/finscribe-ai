import re

with open('src/app/dashboard/expenses/page.tsx', 'r') as f:
    content = f.read()

# Replace:
# <p className="text-foreground font-medium text-lg mb-1">No expenses yet! 🎉</p>
# <p className="text-muted text-sm">Add your first expense using the form above.</p>
# With: "No expenses yet! Add your first one above." (in a single p tag or as requested)

content = content.replace(
    '<p className="text-foreground font-medium text-lg mb-1">No expenses yet! 🎉</p>\n            <p className="text-muted text-sm">Add your first expense using the form above.</p>',
    '<p className="text-foreground font-medium text-lg">No expenses yet! Add your first one above.</p>'
)

with open('src/app/dashboard/expenses/page.tsx', 'w') as f:
    f.write(content)
