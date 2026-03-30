import re

with open('src/app/dashboard/page.tsx', 'r') as f:
    content = f.read()

# Make sure values display exactly as requested for 0 cases
# - Total Balance: ₹0.00
# - Monthly Spend: ₹0.00
# - Savings Rate: 0%
# - Transactions: 0

stats_pattern = r'const stats = \[\n\s+{ label: "Total Balance", value: `₹\$\{totalBalance\.toLocaleString\("en-IN"\)\}`, trend: totalBalance > 0 \? "up" : "neutral", change: "Available" \},\n\s+{ label: "Monthly Spend", value: `₹\$\{totalMonthlySpend\.toLocaleString\("en-IN"\)\}`, trend: "neutral", change: "Current Month" \},\n\s+{ label: "Savings Rate", value: totalBalance > 0 \? `\$\{Math\.round\(\(\(totalBalance - totalMonthlySpend\) / Math\.max\(totalBalance, 1\)\) \* 100\)\}%` : "0%", trend: "neutral", change: "Target" \},\n\s+{ label: "Transactions", value: expenses\.length\.toString\(\), trend: "neutral", change: "This Month" \}\n\s+\];'

replacement = """const stats = [
    { label: "Total Balance", value: totalBalance === 0 ? "₹0.00" : `₹${totalBalance.toLocaleString("en-IN")}`, trend: totalBalance > 0 ? "up" : "neutral", change: "Available" },
    { label: "Monthly Spend", value: totalMonthlySpend === 0 ? "₹0.00" : `₹${totalMonthlySpend.toLocaleString("en-IN")}`, trend: "neutral", change: "Current Month" },
    { label: "Savings Rate", value: totalBalance > 0 ? `${Math.round(((totalBalance - totalMonthlySpend) / Math.max(totalBalance, 1)) * 100)}%` : "0%", trend: "neutral", change: "Target" },
    { label: "Transactions", value: expenses.length === 0 ? "0" : expenses.length.toString(), trend: "neutral", change: "This Month" }
  ];"""

content = re.sub(stats_pattern, replacement, content)

# Check AI text:
# Original: Record more transactions to get personalized AI insights about your spending patterns and savings opportunities.
# Requested: Add your first expense to get personalized AI insights about your spending patterns.
content = content.replace("Record more transactions to get personalized AI insights about your spending patterns and savings opportunities.", "Add your first expense to get personalized AI insights about your spending patterns.")

with open('src/app/dashboard/page.tsx', 'w') as f:
    f.write(content)
