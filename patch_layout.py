import re

with open('src/app/dashboard/layout.tsx', 'r') as f:
    content = f.read()

old_links = """    { href: "/dashboard/emi", label: "EMI Calculator", icon: "🧮" },
    { href: "/dashboard/stocks", label: "Stocks", icon: "📈" },
    { href: "/dashboard/reports", label: "Reports", icon: "📊" },
    { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },"""

new_links = """    { href: "/dashboard/emi", label: "EMI Calculator", icon: "🧮" },
    { href: "/dashboard/stocks", label: "Stocks", icon: "📈" },
    { href: "/dashboard/news", label: "Finance News", icon: "📰" },
    { href: "/dashboard/reports", label: "Reports", icon: "📊" },
    { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },"""

content = content.replace(old_links, new_links)

with open('src/app/dashboard/layout.tsx', 'w') as f:
    f.write(content)
