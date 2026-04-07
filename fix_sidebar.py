import re

with open('src/app/dashboard/layout.tsx', 'r') as f:
    content = f.read()

# Replace Mobile Nav Header
old_nav_header = """      {/* Mobile Nav Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-zinc-950 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-white">
          FinScribe • AI
        </span>
        <button onClick={() => setSidebarOpen(true)}>
          <Menu size={24} className="text-white" />
        </button>
      </div>"""

new_nav_header = """      {/* Mobile Nav Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-zinc-950 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-white text-lg">
          FinScribe AI
        </span>
        <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-zinc-800">
          <Menu size={22} className="text-white" />
        </button>
      </div>"""
content = content.replace(old_nav_header, new_nav_header)

# Replace Mobile Sidebar
old_mobile_sidebar = """      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <aside className="md:hidden fixed left-0 top-0 h-full w-64 bg-zinc-950 z-50 flex flex-col justify-between overflow-y-auto">
          <SidebarContent />
        </aside>
      )}"""

new_mobile_sidebar = """      {/* Mobile Sidebar */}
      <aside className={`md:hidden fixed top-0 right-0 h-full w-72 bg-zinc-950 border-l border-zinc-800 z-50 transform transition-transform duration-300 flex flex-col justify-between overflow-y-auto ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <SidebarContent />
      </aside>"""
content = content.replace(old_mobile_sidebar, new_mobile_sidebar)

# We need to change the close button in SidebarContent for mobile view, although it looks like it's already there with <X/>.
# Let's check how the X is rendered.
old_close = """          <button onClick={() => setSidebarOpen(false)} className="md:hidden">
            <X size={24} className="text-white" />
          </button>"""
new_close = """          <button onClick={() => setSidebarOpen(false)} className="md:hidden">
            <X size={20} className="text-zinc-400" />
          </button>"""
content = content.replace(old_close, new_close)

with open('src/app/dashboard/layout.tsx', 'w') as f:
    f.write(content)
