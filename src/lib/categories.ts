import {
  Car,
  CircleEllipsis,
  Clapperboard,
  HeartPulse,
  ShoppingBag,
  UtensilsCrossed,
  Zap,
  type LucideIcon,
} from 'lucide-react'

export const CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Other',
] as const

export type Category = typeof CATEGORIES[number]

export const categoryIcons: Record<string, LucideIcon> = {
  Food: UtensilsCrossed,
  Transport: Car,
  Shopping: ShoppingBag,
  Bills: Zap,
  Entertainment: Clapperboard,
  Health: HeartPulse,
  Other: CircleEllipsis,
}

export function categoryIcon(category: string) {
  return categoryIcons[category] ?? CircleEllipsis
}
