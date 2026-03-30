import re

with open('src/app/dashboard/ledger/page.tsx', 'r') as f:
    content = f.read()

# Replace initialEntities with empty array
content = re.sub(r'const initialEntities: Entity\[\] = \[[^\]]+\]', 'const initialEntities: Entity[] = []', content)

# The empty state for ledger might not exist, need to check if there is an entities map and add empty state.
# Let's inspect how it renders entities:
# {entities.map(entity => (
