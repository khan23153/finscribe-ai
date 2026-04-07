import re

with open('src/app/dashboard/page.tsx', 'r') as f:
    content = f.read()

# Remove any existing use client directives
content = re.sub(r'["\']use client["\'];?\n?', '', content)

# Add use client at the very beginning
content = '"use client";\n' + content

with open('src/app/dashboard/page.tsx', 'w') as f:
    f.write(content)
