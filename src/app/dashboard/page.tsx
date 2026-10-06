'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useUser } from '@clerk/nextjs'
import { ArrowDownRight, ArrowUpRight, PieChart, Plus, Receipt } from 'lucide-react'
import { CategoryBreakdown, ExpenseRow, TrendChart, type TrendPoint } from '@/components/finance'
import { Alert, Card, CardHeader, EmptyState, Skeleton, buttonClass } from '@/components/ui'
import { isInMonth, type Expense } from '@/lib/expenses'
import { formatINR } from '@/lib/format'
import { useExpenses } from '@/lib/use-expenses'
import { useClientNow } from '@/lib/use-client-now'
import { useLocalStorageValue } from '@/lib/use-local-storage'

export default function DashboardPage() {
  const { user } = useUser()
  const { expenses, isLoading, error } = useExpenses()
  const [budgetValue] = useLocalStorageValue('finscribe-budget', '')

  const clientNow = useClientNow()
  const now = useMemo(() => clientNow ?? new Date(0), [clientNow])
  const lastMonth = useMemo(() => new Date(now.getFullYear(), now.getMonth() - 1, 1), [now])
  const isReady = clientNow !== null && !isLoading

  const summary = useMemo(() => {
    const thisMonth = expenses.filter((expense) => isInMonth(expense.date, now))
    // Compare month-to-date against the same days of last month, not the whole month.
    const previous = expenses.filter((expense) => (
      isInMonth(expense.date, lastMonth) && new Date(expense.date).getDate() <= now.getDate()
    ))
    const total = sum(thisMonth)
    const previousTotal = sum(previous)

    const byCategory = Object.entries(
      thisMonth.reduce<Record<string, number>>((totals, expense) => {
        totals[expense.category] = (totals[expense.category] ?? 0) + Number(expense.amount)
        return totals
      }, {}),
    )
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)

    return {
      count: thisMonth.length,
      total,
      previousTotal,
      byCategory,
      dailyAverage: total / now.getDate(),
    }
  }, [expenses, lastMonth, now])

  const trend = useMemo(() => buildMonthlyTrend(expenses, now), [expenses, now])
  const budget = Number(budgetValue)
  const hasBudget = Number.isFinite(budget) && budget > 0
  const change = summary.previousTotal > 0
    ? ((summary.total - summary.previousTotal) / summary.previousTotal) * 100
    : null
  const monthName = clientNow?.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[13px] text-muted min-h-5">{monthName}</p>
          <h1 className="text-[22px] sm:text-2xl font-semibold tracking-tight mt-0.5">
            {clientNow ? greeting(clientNow) : 'Welcome'}{user?.firstName ? `, ${user.firstName}` : ''}
          </h1>
        </div>
        <Link href="/dashboard/expenses?new=1" className={buttonClass('primary', 'md', 'max-sm:hidden')}>
          <Plus size={16} /> Add expense
        </Link>
      </header>

      {error && <Alert>{error}</Alert>}

      <Card className="p-5 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:gap-10">
          <div>
            <p className="text-[13px] text-muted">Spent this month</p>
            {!isReady ? (
              <Skeleton className="h-10 w-48 mt-2" />
            ) : (
              <p className="mt-1 text-[34px] sm:text-4xl font-semibold tracking-tight tabular">
                {formatINR(summary.total)}
              </p>
            )}
            <div className="mt-2 flex items-center gap-1.5 text-[13px] text-muted min-h-5">
              {isReady && change !== null && (
                <>
                  <span className={`inline-flex items-center gap-0.5 font-medium ${change > 0 ? 'text-negative' : 'text-positive'}`}>
                    {change > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {Math.abs(change).toFixed(0)}%
                  </span>
                  vs. {formatINR(summary.previousTotal)} by this point last month
                </>
              )}
              {isReady && change === null && 'Nothing recorded by this point last month'}
            </div>

            {hasBudget && isReady && (
              <BudgetMeter spent={summary.total} budget={budget} />
            )}
            {!hasBudget && isReady && (
              <p className="mt-5 text-[13px] text-muted">
                <Link href="/dashboard/settings" className="text-accent font-medium hover:underline">Set a monthly budget</Link>
                {' '}to track how much you have left.
              </p>
            )}
          </div>

          <dl className="grid grid-cols-3 lg:grid-cols-1 gap-4 lg:gap-0 lg:divide-y lg:divide-border border-t border-border pt-5 lg:border-t-0 lg:pt-0 lg:border-l lg:pl-10">
            <SummaryItem label="Transactions" value={!isReady ? null : summary.count.toString()} />
            <SummaryItem label="Daily average" value={!isReady ? null : formatINR(summary.dailyAverage)} />
            <SummaryItem label="Top category" value={!isReady ? null : summary.byCategory[0]?.category ?? '—'} />
          </dl>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader title="Monthly spending" description="Last six months" />
          <div className="px-5 pb-5 pt-2">
            {!isReady ? (
              <Skeleton className="h-[190px]" />
            ) : expenses.length === 0 ? (
              <EmptyState icon={PieChart} title="No history yet" description="Your monthly totals will appear here as you record expenses." />
            ) : (
              <TrendChart data={trend} />
            )}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Where it went" description="This month, by category" />
          <div className="px-5 pb-5 pt-2">
            {!isReady ? (
              <div className="space-y-4">
                {[0, 1, 2, 3].map((index) => <Skeleton key={index} className="h-7" />)}
              </div>
            ) : summary.byCategory.length === 0 ? (
              <EmptyState icon={PieChart} title="Nothing this month" description="Add an expense to see the breakdown." />
            ) : (
              <>
                <CategoryBreakdown rows={summary.byCategory.slice(0, 5)} total={summary.total} />
                {summary.byCategory.length > 5 && (
                  <p className="mt-4 text-xs text-muted">
                    +{summary.byCategory.length - 5} more in{' '}
                    <Link href="/dashboard/reports" className="text-accent hover:underline">Reports</Link>
                  </p>
                )}
              </>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Recent activity"
          action={
            expenses.length > 0 && (
              <Link href="/dashboard/expenses" className="text-[13px] font-medium text-accent hover:underline">
                See all
              </Link>
            )
          }
        />
        {!isReady ? (
          <div className="px-5 pb-5 space-y-3">
            {[0, 1, 2].map((index) => <Skeleton key={index} className="h-11" />)}
          </div>
        ) : expenses.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No expenses yet"
            description="Record what you spend and FinScribe will build your monthly picture."
            action={
              <Link href="/dashboard/expenses?new=1" className={buttonClass('primary', 'sm')}>
                <Plus size={14} /> Add your first expense
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-border border-t border-border">
            {expenses.slice(0, 6).map((expense) => (
              <ExpenseRow key={expense.id} expense={expense} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="min-w-0 lg:py-3 lg:first:pt-0 lg:last:pb-0 lg:flex lg:items-baseline lg:justify-between lg:gap-4">
      <dt className="text-xs lg:text-[13px] text-muted">{label}</dt>
      <dd className="mt-1 lg:mt-0 text-[15px] font-semibold tabular truncate">
        {value === null ? <Skeleton className="h-5 w-16" /> : value}
      </dd>
    </div>
  )
}

function BudgetMeter({ spent, budget }: { spent: number; budget: number }) {
  const ratio = spent / budget
  const remaining = budget - spent
  const tone = ratio >= 1 ? 'bg-negative' : ratio >= 0.8 ? 'bg-warning' : 'bg-accent'

  return (
    <div className="mt-5">
      <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.min(ratio * 100, 100)}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-[13px]">
        <span className={remaining < 0 ? 'text-negative font-medium' : 'text-foreground-2'}>
          {remaining >= 0 ? `${formatINR(remaining)} left` : `${formatINR(-remaining)} over budget`}
        </span>
        <span className="text-muted tabular">of {formatINR(budget)}</span>
      </div>
    </div>
  )
}

function sum(expenses: Expense[]) {
  return expenses.reduce((total, expense) => total + Number(expense.amount), 0)
}

function greeting(date: Date) {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function buildMonthlyTrend(expenses: Expense[], now: Date): TrendPoint[] {
  return Array.from({ length: 6 }, (_, index) => {
    const month = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
    return {
      key: `${month.getFullYear()}-${month.getMonth()}`,
      label: month.toLocaleDateString('en-IN', { month: 'short' }),
      amount: sum(expenses.filter((expense) => isInMonth(expense.date, month))),
    }
  })
}
