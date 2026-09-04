'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser, UserButton } from '@clerk/nextjs'
import { useState, type ComponentType } from 'react'
import {
  BarChart2,
  BookOpen,
  Calculator,
  LayoutDashboard,
  Menu,
  Newspaper,
  Receipt,
  Settings,
  Target,
  TrendingUp,
  X,
} from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import AIChatbot from '@/components/AIChatbot'

type NavigationItem = {
  href: string
  label: string
  icon: ComponentType<{ size?: number }>
}

const navigationItems: NavigationItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/expenses', label: 'Expenses', icon: Receipt },
  { href: '/dashboard/ledger', label: 'Ledger', icon: BookOpen },
  { href: '/dashboard/goals', label: 'Goals', icon: Target },
  { href: '/dashboard/emi', label: 'EMI Calculator', icon: Calculator },
  { href: '/dashboard/stocks', label: 'Stocks', icon: TrendingUp },
  { href: '/dashboard/news', label: 'Finance News', icon: Newspaper },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart2 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

type SidebarContentProps = {
  pathname: string
  userName: string
  onNavigate: () => void
}

function SidebarContent({ pathname, userName, onNavigate }: SidebarContentProps) {
  return (
    <>
      <div>
        <div className="p-6 border-b border-border flex justify-between items-center">
          <Link href="/" className="font-display font-bold text-xl flex items-center gap-2 text-foreground">
            FinScribe <span className="w-2 h-2 rounded-full bg-accent inline-block" /> AI
          </Link>
          <button
            type="button"
            onClick={onNavigate}
            className="md:hidden"
            aria-label="Close navigation"
          >
            <X size={20} className="text-muted" />
          </button>
        </div>
        <nav className="p-4 space-y-2" aria-label="Dashboard navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'bg-accent/10 text-accent border-l-2 border-accent'
                    : 'text-muted hover:bg-background hover:text-foreground border-l-2 border-transparent'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-border mt-auto sticky bottom-0 bg-surface space-y-3">
        <ThemeToggle />
        <div className="flex items-center gap-3 bg-background rounded-xl p-3 border border-border">
          <UserButton appearance={{ elements: { userButtonAvatarBox: 'w-8 h-8' } }} />
          <span className="text-sm font-medium truncate text-foreground">{userName}</span>
        </div>
      </div>
    </>
  )
}

export default function DashboardShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname()
  const { user } = useUser()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const userName = user?.firstName || 'User'
  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 w-64 bg-surface border-r border-border hidden md:flex flex-col justify-between z-20 overflow-y-auto">
        <SidebarContent pathname={pathname} userName={userName} onNavigate={closeSidebar} />
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={closeSidebar}
          aria-label="Close navigation"
        />
      )}

      <aside
        aria-hidden={!sidebarOpen}
        className={`md:hidden fixed top-0 right-0 h-full w-72 bg-surface border-l border-border z-50 transform transition-transform duration-300 flex flex-col justify-between overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <SidebarContent pathname={pathname} userName={userName} onNavigate={closeSidebar} />
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-surface border-b border-border px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-foreground text-lg">FinScribe AI</span>
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-background"
          aria-label="Open navigation"
          aria-expanded={sidebarOpen}
        >
          <Menu size={22} />
        </button>
      </div>

      <main className="flex-1 md:ml-64 mt-14 md:mt-0 p-6 md:p-8 overflow-auto relative min-h-screen">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-glow rounded-full blur-[100px] pointer-events-none opacity-50" />
        <div className="max-w-6xl mx-auto relative z-10 pb-20">
          <AIChatbot />
          {children}
        </div>
      </main>
    </div>
  )
}
