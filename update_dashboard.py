with open('src/app/dashboard/page.tsx', 'r') as f:
    content = f.read()

# Make it a client component
if "'use client'" not in content and '"use client"' not in content:
    content = "'use client';\n\n" + content

# Add imports for useState, useEffect
if 'import { useState, useEffect }' not in content:
    content = content.replace('import { Inbox, Plus, BarChart2, Target, Settings } from \'lucide-react\'', 'import { Inbox, Plus, BarChart2, Target, Settings } from \'lucide-react\'\nimport { useState, useEffect } from "react";')

# Define mock replacement logic
def replace_body():
    global content

    # Let's find `export default function DashboardPage() {`
    parts = content.split('export default function DashboardPage() {')
    if len(parts) < 2:
        return

    func_body = parts[1]

    # We need to add state variables at the beginning of the function body
    state_vars = """
  const [monthlySpend, setMonthlySpend] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<Record<string, number>>({});
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    document.cookie =
      'onboarding-bypass=true; max-age=2592000; path=/'

    fetch('/api/expenses')
      .then(r => r.json())
      .then(data => {
        const fetchedExpenses = data.expenses || []
        setExpenses(fetchedExpenses)
        const total = fetchedExpenses.reduce(
          (s: number, e: any) => s + Number(e.amount), 0
        )
        setMonthlySpend(total)
        setTransactionCount(fetchedExpenses.length)
        setRecentExpenses(fetchedExpenses.slice(0, 5))

        const cats: Record<string, number> = {}
        fetchedExpenses.forEach((e: any) => {
          cats[e.category] =
            (cats[e.category] || 0) + Number(e.amount)
        })
        setCategoryData(cats)
      })
      .catch(console.error)
  }, [])
"""

    # remove old mock variables
    lines = func_body.split('\n')
    new_lines = []
    skip = False
    for line in lines:
        if line.strip().startswith('const hasData'):
            skip = True
        if skip and line.strip().startswith('}'): # end of mock data
            # let's be careful, only skip the mock variables definition
            pass

    # Just a simpler regex replacement for mock vars
    import re
    # We want to replace the block starting from `const hasData` up to `const areaD = ...`
    func_body = re.sub(r'const hasData = true.*?(?=const areaD =)', state_vars + '\n  const hasData = recentExpenses.length > 0;\n  ', func_body, flags=re.DOTALL)

    content = parts[0] + 'export default function DashboardPage() {' + func_body

replace_body()

with open('src/app/dashboard/page.tsx', 'w') as f:
    f.write(content)
