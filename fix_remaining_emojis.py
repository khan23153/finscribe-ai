import os

def clean(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    if "dashboard/settings/page.tsx" in filepath:
        content = content.replace('✓', '')
    if "dashboard/stocks/page.tsx" in filepath:
        content = content.replace('⚠️', '')

    with open(filepath, 'w') as f:
        f.write(content)

for root, _, files in os.walk('src/app/dashboard'):
    for file in files:
        if file.endswith('.tsx'):
            filepath = os.path.join(root, file)
            clean(filepath)
