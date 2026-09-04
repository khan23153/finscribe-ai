'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { BarChart2, Inbox, Plus, Settings, Target } from 'lucide-react'
import { isInMonth, type Expense } from '@/lib/expenses'

const chartColors = [
  '#22c55e',
  '#3b82f6',
  '#eab308',
  '#a855f7',
  '#ec4899',
  '#f97316',
  '#71717a',
]

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadExpenses() {
      try {
        const response = await fetch('/api/expenses', {
          cache: 'no-store',
          signal: controller.signal,
        })
        const data = await response.json() as { expenses?: Expense[]; error?: string }

        if (!response.ok) {
          throw new Error(data.error ?? 'Unable to load dashboard data.')
        }

        setExpenses(Array.isArray(data.expenses) ? data.expenses : [])
      } catch (caughtError) {
        if (caughtError instanceof DOMException && caughtError.name === 'AbortError') return
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to load dashboard data.',
        )
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    void loadExpenses()
    return () => controller.abort()
  }, [])

  const currentMonth = useMemo(() => new Date(), [])
  const monthlyExpenses = useMemo(
    () => expenses.filter((expense) => isInMonth(expense.date, currentMonth)),
    [currentMonth, expenses],
  )

  const monthlySpend = monthlyExpenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0,
  )

  const categoryData = monthlyExpenses.reduce<Record<string, number>>((totals, expense) => {
    totals[expense.category] = (totals[expense.category] ?? 0) + Number(expense.amount)
    return totals
  }, {})

  const categoryEntries = Object.entries(categoryData).sort((a, b) => b[1] - a[1])
  const donutBackground = buildDonutGradient(categoryEntries, monthlySpend)
  const trendData = buildMonthlyTrend(expenses, currentMonth)
  const maxTrend = Math.max(...trendData.map((item) => item.amount), 1)
  const hasData = monthlyExpenses.length > 0

  if (!isLoaded || !isSignedIn) return null

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">
            Hi, {user.firstName || 'there'}!
          </h1>
          <p className="text-muted mt-1">Here&apos;s what&apos;s happening with your money this month.</p>
        </div>
        <Link
          href="/dashboard/expenses"
          className="bg-accent hover:bg-accent-dark text-background px-5 py-2.5 rounded-full font-bold text-sm transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> Add Transaction
        </Link>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard label="Monthly Spend" value={`₹${monthlySpend.toLocaleString('en-IN')}`} />
        <MetricCard label="Transactions" value={monthlyExpenses.length.toString()} />
        <MetricCard label="Active Categories" value={categoryEntries.length.toString()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <section className="lg:col-span-3 bg-surface border border-border p-6 rounded-xl min-h-[300px]">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-display font-bold text-lg">Six-month spending trend</h2>
            <span className="text-xs text-muted">Recorded expenses</span>
          </div>

          {isLoading ? (
            <LoadingBlock />
          ) : expenses.length === 0 ? (
            <EmptyState message="Start tracking to see your spending trend." />
          ) : (
            <div className="h-52 flex items-end gap-3 sm:gap-5" aria-label="Monthly spending bar chart">
              {trendData.map((item) => (
                <div key={item.key} className="flex-1 min-w-0 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] sm:text-xs text-muted truncate max-w-full">
                    ₹{compactAmount(item.amount)}
                  </span>
                  <div
                    className="w-full max-w-12 bg-accent rounded-t-md min-h-1 transition-[height]"
                    style={{ height: `${Math.max((item.amount / maxTrend) * 150, 4)}px` }}
                    title={`${item.label}: ₹${item.amount.toLocaleString('en-IN')}`}
                  />
                  <span className="text-xs text-muted">{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="lg:col-span-2 bg-surface border border-border p-6 rounded-xl flex flex-col">
          <h2 className="font-display font-bold text-lg mb-6">Category breakdown</h2>
          {isLoading ? (
            <LoadingBlock />
          ) : !hasData ? (
            <EmptyState message="No spending data for this month." />
          ) : (
            <>
              <div className="flex-1 flex items-center justify-center min-h-[200px]">
                <div
                  className="w-48 h-48 rounded-full flex items-center justify-center"
                  style={{ background: donutBackground }}
                  aria-label="Spending distribution by category"
                >
                  <div className="w-32 h-32 bg-surface rounded-full flex flex-col items-center justify-center">
                    <span className="font-mono font-bold text-xl">₹{compactAmount(monthlySpend)}</span>
                    <span className="text-xs text-muted">This month</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                {categoryEntries.slice(0, chartColors.length).map(([category, amount], index) => (
                  <div key={category} className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: chartColors[index] }}
                    />
                    <span className="text-sm truncate">
                      {category} ({Math.round((amount / monthlySpend) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      <section className="bg-accent/5 border border-accent/30 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6 justify-between">
        <div className="flex items-start gap-4">
          <div className="text-3xl" aria-hidden="true">🧠</div>
          <div>
            <h2 className="font-display font-bold text-lg text-accent mb-1">Financial insight</h2>
            <p className="text-sm text-foreground/80 leading-relaxed max-w-2xl">
              {categoryEntries[0]
                ? `${categoryEntries[0][0]} is your largest recorded category this month at ₹${categoryEntries[0][1].toLocaleString('en-IN')}. Review its transactions before setting next month's budget.`
                : 'Add your first expense to receive insights based on your recorded spending.'}
            </p>
          </div>
        </div>
        {!hasData && (
          <Link
            href="/dashboard/expenses"
            className="bg-accent hover:bg-accent-dark text-background px-6 py-2 rounded-full font-bold text-sm transition-colors whitespace-nowrap"
          >
            Add Expenses &rarr;
          </Link>
        )}
      </section>

      <section className="bg-surface border border-border rounded-xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="font-display font-bold text-lg">Recent transactions</h2>
          <Link href="/dashboard/expenses" className="text-sm text-accent hover:underline">
            View All &rarr;
          </Link>
        </div>

        {isLoading ? (
          <div className="p-6"><LoadingBlock /></div>
        ) : expenses.length === 0 ? (
          <div className="py-12"><EmptyState message="No transactions yet. Add your first expense." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-background/50 border-b border-border text-xs uppercase text-muted">
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.slice(0, 5).map((expense) => (
                  <tr key={expense.id} className="border-b border-border hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-muted whitespace-nowrap">
                      {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{expense.description}</td>
                    <td className="px-6 py-4 text-sm text-muted">{expense.category}</td>
                    <td className="px-6 py-4 font-mono font-bold text-right text-accent">
                      ₹{Number(expense.amount).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Add Expense', icon: Plus, href: '/dashboard/expenses' },
          { label: 'View Reports', icon: BarChart2, href: '/dashboard/reports' },
          { label: 'Set Goal', icon: Target, href: '/dashboard/goals' },
          { label: 'Retake Setup', icon: Settings, href: '/onboarding/quiz' },
        ].map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.href}
              href={action.href}
              className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3 hover:border-accent transition-colors"
            >
              <Icon size={20} />
              <span className="font-medium text-sm">{action.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface border border-border p-6 rounded-xl hover:border-accent/50 transition-colors">
      <h2 className="text-sm font-medium text-muted mb-2">{label}</h2>
      <p className="text-3xl font-mono font-bold">{value}</p>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-muted text-center px-4">
      <Inbox className="w-10 h-10 mb-2 opacity-50" />
      <p className="text-sm">{message}</p>
    </div>
  )
}

function LoadingBlock() {
  return <div className="h-40 rounded-lg bg-background animate-pulse" aria-label="Loading" />
}

function compactAmount(amount: number) {
  return Intl.NumberFormat('en-IN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount)
}

function buildMonthlyTrend(expenses: Expense[], now: Date) {
  return Array.from({ length: 6 }, (_, index) => {
    const month = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
    const amount = expenses
      .filter((expense) => isInMonth(expense.date, month))
      .reduce((total, expense) => total + Number(expense.amount), 0)

    return {
      key: `${month.getFullYear()}-${month.getMonth()}`,
      label: month.toLocaleDateString('en-IN', { month: 'short' }),
      amount,
    }
  })
}

function buildDonutGradient(entries: Array<[string, number]>, total: number) {
  if (total <= 0) return 'var(--color-border)'

  let start = 0
  const stops = entries.slice(0, chartColors.length).map(([, amount], index) => {
    const end = start + (amount / total) * 100
    const segment = `${chartColors[index]} ${start}% ${end}%`
    start = end
    return segment
  })

  if (start < 100) stops.push(`${chartColors.at(-1)} ${start}% 100%`)
  return `conic-gradient(${stops.join(', ')})`
}
