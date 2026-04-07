import re

with open('src/app/dashboard/page.tsx', 'r') as f:
    content = f.read()

# Let's clean up the imports, just find all lucide-react imports and replace with a single one
lucide_imports = re.findall(r"import\s+{([^}]+)}\s+from\s+['\"]lucide-react['\"]", content)
import_names = set()
for m in lucide_imports:
    names = [n.strip() for n in m.split(',')]
    import_names.update(names)

import_names.update(['Inbox', 'Plus', 'BarChart2', 'Target', 'Settings'])

# Remove all old lucide-react imports
content = re.sub(r"import\s+{([^}]+)}\s+from\s+['\"]lucide-react['\"];?\n?", "", content)

# Add new import
new_import = f"import {{ {', '.join(import_names)} }} from 'lucide-react';\n"
content = new_import + content

with open('src/app/dashboard/page.tsx', 'w') as f:
    f.write(content)
