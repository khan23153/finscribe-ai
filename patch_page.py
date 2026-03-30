import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Replace h1 class
old_h1 = '<h1 className="font-display text-4xl md:text-6xl lg:text-7xl leading-tight break-words w-full font-black tracking-tight mb-6">'
new_h1 = '<h1 className="font-display text-4xl md:text-6xl lg:text-7xl leading-tight break-words w-full font-black tracking-tight mb-6">'
# Looks like it's already updated partially in my previous checks. Let me see the main section.
