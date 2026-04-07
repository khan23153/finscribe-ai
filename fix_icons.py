import re

with open('src/app/dashboard/page.tsx', 'r') as f:
    content = f.read()

# Make sure imports are there
if "import { Inbox, Plus, BarChart2, Target, Settings } from 'lucide-react'" not in content:
    if "import { Inbox } from 'lucide-react'" in content:
        content = content.replace("import { Inbox } from 'lucide-react'", "import { Inbox, Plus, BarChart2, Target, Settings } from 'lucide-react'")
    else:
        content = "import { Inbox, Plus, BarChart2, Target, Settings } from 'lucide-react';\n" + content

with open('src/app/dashboard/page.tsx', 'w') as f:
    f.write(content)
