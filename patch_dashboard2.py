import re

with open('src/app/dashboard/page.tsx', 'r') as f:
    content = f.read()

# Replace: "No transactions yet." and "Add your first expense to get started!"
# With: "No transactions yet. Add your first expense!" as per request
content = content.replace('            <p className="text-lg font-medium mb-1">No transactions yet.</p>\n            <p className="text-sm mb-6">Add your first expense to get started!</p>',
                          '            <p className="text-lg font-medium mb-6">No transactions yet. Add your first expense!</p>')


# Replace: "No expenses categorized yet."
# With: "No data yet"
content = content.replace('No expenses categorized yet.', 'No data yet')

with open('src/app/dashboard/page.tsx', 'w') as f:
    f.write(content)
