import re

with open('prisma/schema.prisma', 'r') as f:
    content = f.read()

# Remove onboardingComplete from User model
content = re.sub(r'onboardingComplete\s+Boolean\s+@default\(false\)\n', '', content)

with open('prisma/schema.prisma', 'w') as f:
    f.write(content)
