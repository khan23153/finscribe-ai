'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { BarChart3, Home, MessageSquare, MoreHorizontal, Plus, Receipt } from 'lucide-react'
import AssistantPanel from '@/components/AIChatbot'
import Logo from '@/components/Logo'
import Sheet from '@/components/Sheet'
import ThemeToggle from '@/components/ThemeToggle'
import { cx } from '@/components/ui'
import {
  allNavigationItems,
  isActivePath,
  navigationGroups,
  settingsItem,
  type NavigationItem,
} from '@/lib/navigation'

export default function DashboardShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname()
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'j') {
        event.preventDefault()
        setAssistantOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const currentItem = [...allNavigationItems]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => isActivePath(pathname, item.href))

  return (
    <div className="min-h-dvh">
      <Sidebar pathname={pathname} onOpenAssistant={() => setAssistantOpen(true)} />

      <MobileTopBar
        title={currentItem?.label ?? 'FinScribe'}
        onOpenAssistant={() => setAssistantOpen(true)}
      />

      <main className="lg:pl-60">
        <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-10 pt-[calc(3.5rem+env(safe-area-inset-top)+1.25rem)] lg:pt-10 pb-[calc(4.5rem+env(safe-area-inset-bottom)+1.5rem)] lg:pb-16">
          {children}
        </div>
      </main>

      <MobileTabBar pathname={pathname} onOpenMore={() => setMoreOpen(true)} />

      <Sheet open={moreOpen} onClose={() => setMoreOpen(false)} title="More">
        <nav className="-mx-2 grid gap-0.5" aria-label="More">
          {allNavigationItems
            .filter((item) => !['/dashboard', '/dashboard/expenses', '/dashboard/reports'].includes(item.href))
            .map((item) => (
              <NavLink key={item.href} item={item} active={isActivePath(pathname, item.href)} onClick={() => setMoreOpen(false)} large />
            ))}
          <button
            type="button"
            onClick={() => {
              setMoreOpen(false)
              setAssistantOpen(true)
            }}
            className="flex items-center gap-3 h-11 px-3 rounded-lg text-[15px] text-foreground-2 hover:bg-surface-2"
          >
            <MessageSquare size={18} className="text-muted" />
            Assistant
          </button>
        </nav>
      </Sheet>

      <AssistantPanel open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </div>
  )
}

function Sidebar({ pathname, onOpenAssistant }: { pathname: string; onOpenAssistant: () => void }) {
  const { user } = useUser()

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-60 flex-col border-r border-border bg-surface">
      <div className="h-14 flex items-center justify-between px-4">
        <Logo href="/dashboard" />
        <ThemeToggle />
      </div>

      <div className="px-3 pb-2">
        <button
          type="button"
          onClick={onOpenAssistant}
          className="w-full h-9 flex items-center gap-2.5 px-2.5 rounded-lg border border-border bg-background text-[13px] text-muted hover:text-foreground hover:border-border-strong transition-colors"
        >
          <MessageSquare size={15} />
          <span className="flex-1 text-left">Ask the assistant</span>
          <kbd className="font-sans text-[11px] text-subtle">Ctrl J</kbd>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5" aria-label="Main">
        {navigationGroups.map((group, index) => (
          <div key={group.label ?? index}>
            {group.label && (
              <p className="px-2.5 mb-1 text-[11px] font-medium uppercase tracking-wider text-subtle">{group.label}</p>
            )}
            <div className="grid gap-px">
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} active={isActivePath(pathname, item.href)} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3 space-y-1">
        <NavLink item={settingsItem} active={isActivePath(pathname, settingsItem.href)} />
        <div className="flex items-center gap-2.5 px-2.5 h-11">
          <UserButton appearance={{ elements: { userButtonAvatarBox: 'w-7 h-7' } }} />
          <div className="min-w-0">
            <p className="text-[13px] font-medium truncate">{user?.fullName || user?.firstName || 'Account'}</p>
            <p className="text-xs text-muted truncate">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

function NavLink({
  item,
  active,
  onClick,
  large = false,
}: {
  item: NavigationItem
  active: boolean
  onClick?: () => void
  large?: boolean
}) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cx(
        'flex items-center gap-3 rounded-lg transition-colors',
        large ? 'h-11 px-3 text-[15px]' : 'h-8 px-2.5 text-[13px]',
        active
          ? 'bg-surface-2 text-foreground font-medium'
          : 'text-foreground-2 hover:bg-surface-2 hover:text-foreground',
      )}
    >
      <Icon size={large ? 18 : 16} className={active ? 'text-accent' : 'text-muted'} />
      {item.label}
    </Link>
  )
}

function MobileTopBar({ title, onOpenAssistant }: { title: string; onOpenAssistant: () => void }) {
  return (
    <header className="lg:hidden fixed top-0 inset-x-0 z-30 bg-background/85 backdrop-blur-md border-b border-border pt-safe">
      <div className="h-14 flex items-center justify-between px-4">
        <span className="text-[15px] font-semibold tracking-tight">{title}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onOpenAssistant}
            className="h-9 w-9 rounded-lg flex items-center justify-center text-foreground-2 hover:bg-surface-2"
            aria-label="Open assistant"
          >
            <MessageSquare size={19} />
          </button>
          <div className="ml-1 flex items-center">
            <UserButton appearance={{ elements: { userButtonAvatarBox: 'w-7 h-7' } }} />
          </div>
        </div>
      </div>
    </header>
  )
}

const tabs = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/expenses', label: 'Expenses', icon: Receipt },
  { href: '/dashboard/expenses?new=1', label: 'Add', icon: Plus, primary: true },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
]

function MobileTabBar({ pathname, onOpenMore }: { pathname: string; onOpenMore: () => void }) {
  const isMoreActive = !['/dashboard', '/dashboard/expenses', '/dashboard/reports'].some((href) => isActivePath(pathname, href))

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-surface/95 backdrop-blur-md border-t border-border pb-safe"
      aria-label="Primary"
    >
      <div className="h-[4.5rem] grid grid-cols-5 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = !tab.primary && isActivePath(pathname, tab.href)

          if (tab.primary) {
            return (
              <Link key={tab.href} href={tab.href} className="flex items-center justify-center" aria-label="Add expense">
                <span className="h-11 w-11 rounded-xl bg-accent text-accent-foreground flex items-center justify-center shadow-card">
                  <Icon size={22} strokeWidth={2.2} />
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={cx(
                'flex flex-col items-center justify-center gap-1 text-[11px] font-medium',
                active ? 'text-foreground' : 'text-muted',
              )}
            >
              <Icon size={21} strokeWidth={active ? 2.2 : 1.8} className={active ? 'text-accent' : undefined} />
              {tab.label}
            </Link>
          )
        })}
        <button
          type="button"
          onClick={onOpenMore}
          className={cx(
            'flex flex-col items-center justify-center gap-1 text-[11px] font-medium',
            isMoreActive ? 'text-foreground' : 'text-muted',
          )}
        >
          <MoreHorizontal size={21} strokeWidth={isMoreActive ? 2.2 : 1.8} className={isMoreActive ? 'text-accent' : undefined} />
          More
        </button>
      </div>
    </nav>
  )
}
