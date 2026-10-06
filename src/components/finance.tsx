'use client'

import { createElement, useState, type ReactNode } from 'react'
import { categoryIcon } from '@/lib/categories'
import type { Expense } from '@/lib/expenses'
import { formatCompactINR, formatINR, formatShortDate } from '@/lib/format'
import { cx } from '@/components/ui'

export function CategoryIcon({ category, size = 'md' }: { category: string; size?: 'sm' | 'md' }) {
  return (
    <span
      className={cx(
        'shrink-0 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-foreground-2',
        size === 'md' ? 'h-9 w-9' : 'h-7 w-7',
      )}
      aria-hidden="true"
    >
      {createElement(categoryIcon(category), { size: size === 'md' ? 16 : 14, strokeWidth: 1.8 })}
    </span>
  )
}

export function ExpenseRow({ expense, trailing }: { expense: Expense; trailing?: ReactNode }) {
  return (
    <li className="flex items-center gap-3 px-5 py-3">
      <CategoryIcon category={expense.category} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">{expense.description}</p>
        <p className="text-xs text-muted mt-0.5">
          {expense.category} · {formatShortDate(expense.date)}
        </p>
      </div>
      <p className="text-sm font-medium tabular text-foreground">
        −{formatINR(Number(expense.amount), { precise: !Number.isInteger(Number(expense.amount)) })}
      </p>
      {trailing}
    </li>
  )
}

export type TrendPoint = { key: string; label: string; amount: number }

/**
 * Single-series column chart. The latest period is drawn in the accent colour;
 * earlier periods are muted so the current month reads first.
 */
export function TrendChart({ data, height = 168 }: { data: TrendPoint[]; height?: number }) {
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const max = Math.max(...data.map((point) => point.amount), 1)
  const latestKey = data.at(-1)?.key
  const shownKey = activeKey ?? latestKey

  return (
    <div>
      <div className="relative flex items-end gap-2 sm:gap-3 border-b border-border-strong" style={{ height }}>
        {[0.5, 1].map((fraction) => (
          <div
            key={fraction}
            className="absolute inset-x-0 border-t border-dashed border-border"
            style={{ bottom: `${fraction * 100}%` }}
            aria-hidden="true"
          />
        ))}
        {data.map((point) => {
          const isLatest = point.key === latestKey
          const isShown = point.key === shownKey
          const barHeight = point.amount > 0 ? Math.max((point.amount / max) * 100, 2) : 0

          return (
            <button
              key={point.key}
              type="button"
              onMouseEnter={() => setActiveKey(point.key)}
              onMouseLeave={() => setActiveKey(null)}
              onFocus={() => setActiveKey(point.key)}
              onBlur={() => setActiveKey(null)}
              className="relative z-10 flex-1 h-full flex items-end justify-center group focus:outline-none"
              aria-label={`${point.label}: ${formatINR(point.amount)}`}
            >
              {isShown && (
                <span
                  className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-1.5 py-0.5 text-[11px] font-medium text-background tabular pointer-events-none"
                  style={{ bottom: `calc(${barHeight}% + 6px)` }}
                >
                  {formatCompactINR(point.amount)}
                </span>
              )}
              <span
                className={cx(
                  'w-full max-w-10 rounded-t-[4px] transition-colors',
                  isLatest ? 'bg-accent' : 'bg-accent/30 group-hover:bg-accent/45',
                )}
                style={{ height: `${barHeight}%` }}
              />
            </button>
          )
        })}
      </div>
      <div className="flex gap-2 sm:gap-3 mt-2">
        {data.map((point) => (
          <span
            key={point.key}
            className={cx('flex-1 text-center text-[11px]', point.key === shownKey ? 'text-foreground font-medium' : 'text-muted')}
          >
            {point.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export function CategoryBreakdown({
  rows,
  total,
}: {
  rows: Array<{ category: string; amount: number; count?: number }>
  total: number
}) {
  return (
    <ul className="space-y-3.5">
      {rows.map((row) => {
        const share = total > 0 ? (row.amount / total) * 100 : 0
        return (
          <li key={row.category}>
            <div className="flex items-baseline justify-between gap-3 text-[13px]">
              <span className="text-foreground-2 truncate">
                {row.category}
                {row.count !== undefined && <span className="text-muted"> · {row.count}</span>}
              </span>
              <span className="tabular text-foreground font-medium shrink-0">
                {formatINR(row.amount)}
                <span className="text-muted font-normal ml-2 inline-block w-9 text-right">{Math.round(share)}%</span>
              </span>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full bg-surface-2 overflow-hidden">
              <div className="h-full rounded-full bg-accent" style={{ width: `${share}%` }} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
