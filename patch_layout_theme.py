import re

with open('src/app/dashboard/layout.tsx', 'r') as f:
    content = f.read()

# Add import
import_line = 'import ThemeToggle from "../../components/ThemeToggle";\n'
if 'ThemeToggle' not in content:
    content = content.replace('import AIChatbot', import_line + 'import AIChatbot')

# Add to sidebar
old_sidebar_bottom = """        </div>
        <div className="p-4 border-t border-border mt-auto sticky bottom-0 bg-surface">
          <div className="flex items-center justify-between bg-background rounded-xl p-3 border border-border">
            <div className="flex items-center gap-3">
              <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8" } }} />"""

new_sidebar_bottom = """        </div>
        <div className="p-4 border-t border-border mt-auto sticky bottom-0 bg-surface space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-sm text-muted font-medium">Theme</span>
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-between bg-background rounded-xl p-3 border border-border">
            <div className="flex items-center gap-3">
              <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8" } }} />"""

content = content.replace(old_sidebar_bottom, new_sidebar_bottom)

with open('src/app/dashboard/layout.tsx', 'w') as f:
    f.write(content)
