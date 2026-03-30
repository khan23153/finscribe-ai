import re

with open('src/app/dashboard/stocks/page.tsx', 'r') as f:
    content = f.read()

# Make sure portfolio tracker maps over an empty array []
old_str = """                  {[
                    { sym: "TATAMOTORS", qty: 50, buy: 650.20, ltp: 924.50 },
                    { sym: "ITC", qty: 100, buy: 440.50, ltp: 412.30 },
                    { sym: "ZOMATO", qty: 200, buy: 85.00, ltp: 165.40 },
                  ].map(pos => {"""

new_str = """                  {[].map((pos: { sym: string, qty: number, buy: number, ltp: number }) => {"""

content = content.replace(old_str, new_str)

# Also clear the Total P&L
old_str2 = """              <span className="text-xs font-mono bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded">
                Total P&L: +₹14,520
              </span>"""

new_str2 = """              <span className="text-xs font-mono bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 px-2 py-1 rounded">
                Total P&L: ₹0.00
              </span>"""

content = content.replace(old_str2, new_str2)

with open('src/app/dashboard/stocks/page.tsx', 'w') as f:
    f.write(content)
