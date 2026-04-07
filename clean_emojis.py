import re
import os

def remove_emoji(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # The brain icon is kept. Emojis that are to be replaced via instructions will be handled individually.
    # But first let's just make specific target substitutions for generic emojis.

    # 1. dashboard/page.tsx
    if "dashboard/page.tsx" in filepath:
        # replace Quick Actions icons
        content = content.replace('{ label: "Add Expense", icon: "➕", href: "/dashboard/expenses" }', '{ label: "Add Expense", icon: <Plus size={20} />, href: "/dashboard/expenses" }')
        content = content.replace('{ label: "View Reports", icon: "📊", href: "/dashboard/reports" }', '{ label: "View Reports", icon: <BarChart2 size={20} />, href: "/dashboard/reports" }')
        content = content.replace('{ label: "Set Goal", icon: "🎯", href: "/dashboard/goals" }', '{ label: "Set Goal", icon: <Target size={20} />, href: "/dashboard/goals" }')
        content = content.replace('{ label: "Retake Setup", icon: "⚙️", href: "/onboarding/quiz" }', '{ label: "Retake Setup", icon: <Settings size={20} />, href: "/onboarding/quiz" }')

        # We need to import the icons
        if "from 'lucide-react'" in content:
            content = re.sub(r'import {(.*?)} from \'lucide-react\'', r'import {\1, Plus, BarChart2, Target, Settings } from \'lucide-react\'', content)
        else:
            content = content.replace('import { Inbox } from \'lucide-react\'', 'import { Inbox, Plus, BarChart2, Target, Settings } from \'lucide-react\'')

        # Remove <span className="text-xl">{action.icon}</span> -> {action.icon}
        content = content.replace('<span className="text-xl">{action.icon}</span>', '{action.icon}')

        # remove 👋
        content = content.replace('👋', '')

    if "dashboard/expenses/page.tsx" in filepath:
        content = content.replace('💸', '')

    if "dashboard/goals/page.tsx" in filepath:
        content = content.replace('🎉', '')
        content = content.replace('🟢', '')
        content = content.replace('🔴', '')

    if "dashboard/reports/page.tsx" in filepath:
        pass # Only brain emoji here, keep it. Wait, I'll check.

    if "dashboard/emi/page.tsx" in filepath:
        pass

    if "dashboard/stocks/page.tsx" in filepath:
        pass

    if "dashboard/news/page.tsx" in filepath:
        content = content.replace('📰', '')

    with open(filepath, 'w') as f:
        f.write(content)

for root, _, files in os.walk('src/app/dashboard'):
    for file in files:
        if file.endswith('.tsx'):
            filepath = os.path.join(root, file)
            remove_emoji(filepath)
