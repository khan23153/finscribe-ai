import {
  BarChart3,
  BookUser,
  Calculator,
  Home,
  LineChart,
  Newspaper,
  Receipt,
  Settings,
  Target,
  type LucideIcon,
} from 'lucide-react'

export type NavigationItem = {
  href: string
  label: string
  icon: LucideIcon
}

export const navigationGroups: Array<{ label?: string; items: NavigationItem[] }> = [
  {
    items: [
      { href: '/dashboard', label: 'Home', icon: Home },
      { href: '/dashboard/expenses', label: 'Expenses', icon: Receipt },
      { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
    ],
  },
  {
    label: 'Planning',
    items: [
      { href: '/dashboard/goals', label: 'Goals', icon: Target },
      { href: '/dashboard/ledger', label: 'Ledger', icon: BookUser },
      { href: '/dashboard/emi', label: 'Loan calculator', icon: Calculator },
    ],
  },
  {
    label: 'Markets',
    items: [
      { href: '/dashboard/stocks', label: 'Stock research', icon: LineChart },
      { href: '/dashboard/news', label: 'News', icon: Newspaper },
    ],
  },
]

export const settingsItem: NavigationItem = {
  href: '/dashboard/settings',
  label: 'Settings',
  icon: Settings,
}

export const allNavigationItems = [
  ...navigationGroups.flatMap((group) => group.items),
  settingsItem,
]

export function isActivePath(pathname: string, href: string) {
  return href === '/dashboard' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
}
