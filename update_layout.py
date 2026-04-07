import re

with open('src/app/dashboard/layout.tsx', 'r') as f:
    content = f.read()

# Add icons to import
import_statement = 'import { Menu, X } from "lucide-react";'
new_import = 'import { Menu, X, LayoutDashboard, Receipt, BookOpen, Target, Calculator, TrendingUp, Newspaper, BarChart2, Settings } from "lucide-react";'
content = content.replace(import_statement, new_import)

# Replace links
links_replacement = """  const links = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { href: "/dashboard/expenses", label: "Expenses", icon: <Receipt size={20} /> },
    { href: "/dashboard/ledger", label: "Ledger", icon: <BookOpen size={20} /> },
    { href: "/dashboard/goals", label: "Goals", icon: <Target size={20} /> },
    { href: "/dashboard/emi", label: "EMI Calculator", icon: <Calculator size={20} /> },
    { href: "/dashboard/stocks", label: "Stocks", icon: <TrendingUp size={20} /> },
    { href: "/dashboard/news", label: "Finance News", icon: <Newspaper size={20} /> },
    { href: "/dashboard/reports", label: "Reports", icon: <BarChart2 size={20} /> },
    { href: "/dashboard/settings", label: "Settings", icon: <Settings size={20} /> },
  ];"""

content = re.sub(r'const links = \[.*?\];', links_replacement, content, flags=re.DOTALL)

# Remove span around icon since it's already an element
content = content.replace('<span className="text-xl">{link.icon}</span>', '{link.icon}')

with open('src/app/dashboard/layout.tsx', 'w') as f:
    f.write(content)
