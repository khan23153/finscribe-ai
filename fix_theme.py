import re

# Fix globals.css
with open('src/app/globals.css', 'r') as f:
    css = f.read()

light_css_replacement = """html.light,
html.light body {
  --color-background: #f8fafc;
  --color-surface: #ffffff;
  --color-border: #e2e8f0;
  --color-foreground: #0f172a;
  --color-muted: #64748b;
  background-color: #f8fafc;
  color: #0f172a;
}

html.light .bg-zinc-950 { background-color: #f1f5f9; }
html.light .bg-zinc-900 { background-color: #ffffff; }
html.light .bg-zinc-800 { background-color: #e2e8f0; }
html.light .text-white { color: #0f172a; }
html.light .text-zinc-400 { color: #64748b; }
html.light .text-zinc-300 { color: #475569; }
html.light .border-zinc-800 { border-color: #e2e8f0; }
html.light .border-zinc-700 { border-color: #cbd5e1; }"""

css = re.sub(r'html\.light \{.*?html\.light body \{.*?\}', light_css_replacement, css, flags=re.DOTALL)

with open('src/app/globals.css', 'w') as f:
    f.write(css)

# Fix ThemeToggle.tsx
with open('src/components/ThemeToggle.tsx', 'r') as f:
    toggle_code = f.read()

old_toggle = """  const toggle = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    if (newIsDark) {
      document.documentElement.classList.remove('light')
      localStorage.setItem('finscribe-theme', 'dark')
    } else {
      document.documentElement.classList.add('light')
      localStorage.setItem('finscribe-theme', 'light')
    }
  }"""

new_toggle = """  const toggle = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    if (newIsDark) {
      document.documentElement.classList.remove('light')
      document.body.classList.remove('light')
      localStorage.setItem('finscribe-theme', 'dark')
    } else {
      document.documentElement.classList.add('light')
      document.body.classList.add('light')
      localStorage.setItem('finscribe-theme', 'light')
    }
  }"""
toggle_code = toggle_code.replace(old_toggle, new_toggle)

# Update useEffect as well to apply to body
old_use_effect = """  useEffect(() => {
    const saved = localStorage.getItem('finscribe-theme')
    if (saved === 'light') {
      setIsDark(false)
      document.documentElement.classList.add('light')
    }
  }, [])"""

new_use_effect = """  useEffect(() => {
    const saved = localStorage.getItem('finscribe-theme')
    if (saved === 'light') {
      setIsDark(false)
      document.documentElement.classList.add('light')
      document.body.classList.add('light')
    }
  }, [])"""
toggle_code = toggle_code.replace(old_use_effect, new_use_effect)

with open('src/components/ThemeToggle.tsx', 'w') as f:
    f.write(toggle_code)
