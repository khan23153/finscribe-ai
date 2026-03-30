import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Add overflow-hidden w-full to main
content = content.replace('className="flex-1 max-w-7xl mx-auto px-6 py-20 lg:py-32 w-full overflow-x-hidden flex flex-col items-center text-center relative z-10"',
                          'className="flex-1 max-w-7xl mx-auto px-6 py-20 lg:py-32 w-full overflow-hidden flex flex-col items-center text-center relative z-10"')

# Ensure the hero section div has overflow-x-hidden
content = content.replace('<div className="px-4 max-w-full overflow-hidden w-full flex flex-col items-center">',
                          '<div className="px-4 max-w-full overflow-x-hidden w-full flex flex-col items-center">')

with open('src/app/page.tsx', 'w') as f:
    f.write(content)
