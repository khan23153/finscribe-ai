#!/bin/bash
cat << 'INNER_EOF' > update.py
import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Fix 1: Navbar
content = content.replace('className="sticky top-0 z-50 backdrop-blur-md border-b border-border bg-background/80"', 'className="sticky top-0 z-50 backdrop-blur-md border-b border-border bg-background/80 rounded-none"')
content = content.replace('font-display font-bold text-xl flex items-center gap-1', 'font-display font-bold text-2xl font-black flex items-center gap-1')
content = content.replace('gap-8 text-sm font-medium', 'gap-6 text-sm font-medium')
content = content.replace('bg-accent hover:bg-accent-dark text-background px-4 py-2 rounded-full transition-colors font-bold', 'bg-accent hover:bg-accent-dark text-background px-5 py-2.5 rounded-xl transition-colors text-sm font-bold')

# Fix 2 & Fix 7: Hero Section & Global max-w-6xl
# Global mobile fixes: All sections max-w: max-w-6xl (consistent)
# Exception: Hero main container: max-w-5xl mx-auto
content = content.replace('max-w-7xl mx-auto px-6 h-16 flex items-center justify-between', 'max-w-6xl mx-auto px-6 h-16 flex items-center justify-between')
content = content.replace('flex-1 max-w-7xl mx-auto px-6 py-20 lg:py-32 w-full overflow-hidden flex flex-col items-center text-center relative z-10', 'flex-1 max-w-5xl mx-auto px-6 md:px-8 py-20 lg:py-32 w-full overflow-hidden flex flex-col items-center text-center relative z-10')
content = content.replace('font-display text-4xl md:text-6xl lg:text-7xl leading-tight break-words w-full font-black tracking-tight mb-6', 'font-display text-5xl md:text-7xl lg:text-8xl leading-none break-words w-full font-black tracking-tighter mb-6')
content = content.replace('bg-accent hover:bg-accent-dark text-background px-8 py-3 rounded-full font-bold text-lg transition-colors w-full sm:w-auto', 'bg-accent hover:bg-accent-dark text-background px-10 py-4 rounded-2xl font-bold text-base shadow-lg shadow-accent/25 transition-colors w-full sm:w-auto')
content = content.replace('px-8 py-3 rounded-full font-bold text-lg hover:bg-surface transition-colors w-full sm:w-auto', 'px-10 py-4 rounded-2xl font-bold text-base border border-border hover:border-accent hover:bg-surface transition-colors w-full sm:w-auto')

# Fix 8: Floating Stat Cards
content = content.replace('hidden lg:flex absolute -left-48 top-4 flex-col gap-1 bg-surface/80 backdrop-blur border border-border p-4 rounded-xl shadow-2xl rotate-[-4deg]', 'hidden lg:flex absolute -left-48 top-4 flex-col gap-1 bg-surface/80 backdrop-blur-xl border border-border border-accent/20 p-4 rounded-xl shadow-2xl rotate-[-2deg]')
content = content.replace('hidden lg:flex absolute -right-48 -bottom-12 flex-col gap-1 bg-surface/80 backdrop-blur border border-border p-4 rounded-xl shadow-2xl rotate-[3deg]', 'hidden lg:flex absolute -right-48 -bottom-12 flex-col gap-1 bg-surface/80 backdrop-blur-xl border border-border border-accent/20 p-4 rounded-xl shadow-2xl rotate-[3deg]')

# Fix 3: Stats Bar & Fix 7: max-w-6xl
content = content.replace('max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center', 'max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-border')
content = content.replace('className="bg-surface py-12 border-y border-border relative z-10"', 'className="py-12 border-y border-border relative z-10"') # remove bg-surface to remove background? Wait, "no card borders, just text", they didn't have borders or card backgrounds anyway, just the section had bg-surface. Let's see:
# Wait, "Each stat card: no card borders, just text". In the original code, there's no cards inside, just divs. Maybe they meant the dividers. I will leave bg-surface on section, but add divide-x.
content = content.replace('font-mono text-3xl font-bold mb-1', 'font-mono text-4xl font-black mb-1')
content = content.replace('text-muted text-sm', 'text-muted text-sm uppercase tracking-wide')

# Fix 4: Feature Cards & Fix 7: max-w-6xl
content = content.replace('<div className="max-w-7xl mx-auto px-6">', '<div className="max-w-6xl mx-auto px-6">')
content = content.replace('grid md:grid-cols-3 gap-6', 'grid md:grid-cols-3 gap-8')
content = content.replace('bg-surface border border-border rounded-xl p-6 hover:border-accent transition-colors group', 'bg-surface border border-border rounded-2xl p-8 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10 hover:border-l-4 hover:border-l-accent transition-all group')
content = content.replace('text-3xl mb-4 group-hover:scale-110 transition-transform origin-left', 'text-4xl mb-6 group-hover:scale-110 transition-transform origin-left')
# Title is already 'font-display font-bold text-xl mb-2', need mb-3
content = content.replace('font-display font-bold text-xl mb-2', 'font-display font-bold text-xl mb-3')

# Fix 5: How It Works
content = content.replace('font-mono text-6xl font-black text-accent/20 mb-4', 'font-mono text-8xl font-black text-accent/20 mb-4')
content = content.replace('className="flex flex-col items-center relative"', 'className="flex flex-col items-center relative bg-surface border border-border rounded-2xl p-8 hover:border-accent/30 transition-all shadow-sm hover:shadow-md"')
# Also fix max-w for how it works
# Already done by <div className="max-w-7xl mx-auto px-6"> replace!

# Fix 6: Footer
content = content.replace('<footer className="border-t border-border mt-auto relative z-10 bg-background">', '<footer className="border-t border-border mt-auto relative z-10 bg-background">\n        <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />')
content = content.replace('max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4', 'max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4')
content = content.replace('text-sm text-muted\n            &copy;', 'text-sm text-muted/60\n            &copy;')
content = content.replace('<div className="text-sm text-muted">\n            &copy;', '<div className="text-sm text-muted/60">\n            &copy;')

# Fix 7: Ensure no horizontal overflow anywhere
content = content.replace('min-h-screen flex flex-col relative overflow-hidden', 'min-h-screen flex flex-col relative overflow-hidden overflow-x-hidden')

# Fix footer extra
content = content.replace('<span className="text-muted text-sm uppercase tracking-wide">&mdash; Intelligent Financial Ledger</span>', '<span className="text-muted text-sm">&mdash; Intelligent Financial Ledger</span>')

with open('src/app/page.tsx', 'w') as f:
    f.write(content)
INNER_EOF
python3 update.py
