'use client'

import { useEffect, useMemo, useState } from 'react'
import { Calendar, Sparkles } from 'lucide-react'
import { startOfPeriod, type Expense } from '@/lib/expenses'

const periods = ['This Week', 'This Month', 'Last 3 Months', 'This Year'] as const
type Period = typeof periods[number]

type AiResponse = {
  reply?: string
  error?: string
}

export default function ReportsPage() {
  const [activePeriod, setActivePeriod] = useState<Period>('This Month')
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [aiReport, setAiReport] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function loadExpenses() {
      try {
        const response = await fetch('/api/expenses', {
          cache: 'no-store',
          signal: controller.signal,
        })
        const data = await response.json() as { expenses?: Expense[]; error?: string }
        if (!response.ok) throw new Error(data.error ?? 'Unable to load report data.')
        setExpenses(Array.isArray(data.expenses) ? data.expenses : [])
      } catch (caughtError) {
        if (caughtError instanceof DOMException && caughtError.name === 'AbortError') return
        setError(caughtError instanceof Error ? caughtError.message : 'Unable to load report data.')
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    void loadExpenses()
    return () => controller.abort()
  }, [])

  const periodExpenses = useMemo(() => {
    const start = startOfPeriod(activePeriod)
    return expenses.filter((expense) => new Date(expense.date) >= start)
  }, [activePeriod, expenses])

  const totalSpent = periodExpenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0,
  )
  const averageTransaction = periodExpenses.length > 0
    ? totalSpent / periodExpenses.length
    : 0

  const categories = Object.entries(
    periodExpenses.reduce<Record<string, { amount: number; count: number }>>((totals, expense) => {
      const current = totals[expense.category] ?? { amount: 0, count: 0 }
      totals[expense.category] = {
        amount: current.amount + Number(expense.amount),
        count: current.count + 1,
      }
      return totals
    }, {}),
  ).sort((a, b) => b[1].amount - a[1].amount)

  const generateReport = async () => {
    if (periodExpenses.length === 0) return

    setIsGenerating(true)
    setAiReport('')
    setError(null)

    try {
      const categorySummary = categories
        .map(([category, values]) => `${category}: ₹${values.amount.toFixed(2)} (${values.count} transactions)`)
        .join('; ')

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'report',
          messages: [{
            role: 'user',
            content: `Period: ${activePeriod}. Total recorded expenses: ₹${totalSpent.toFixed(2)} across ${periodExpenses.length} transactions. Categories: ${categorySummary}. Give three observations and two practical recommendations.`,
          }],
        }),
      })
      const data = await response.json() as AiResponse
      if (!response.ok || !data.reply) {
        throw new Error(data.error ?? 'Unable to generate the report.')
      }
      setAiReport(data.reply)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to generate the report.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Financial Reports</h1>
        <p className="text-muted">Analyze the expenses you have recorded.</p>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex overflow-x-auto gap-2 pb-2" style={{ scrollbarWidth: 'none' }}>
        {periods.map((period) => (
          <button
            key={period}
            type="button"
            onClick={() => setActivePeriod(period)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
              activePeriod === period
                ? 'bg-accent text-black font-medium'
                : 'bg-surface text-muted border border-border hover:bg-background'
            }`}
          >
            <Calendar size={14} />
            {period}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Total Spent" value={`₹${totalSpent.toLocaleString('en-IN')}`} color="red" />
        <SummaryCard label="Transactions" value={periodExpenses.length.toString()} color="blue" />
        <SummaryCard label="Average" value={`₹${averageTransaction.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} color="green" />
        <SummaryCard label="Top Category" value={categories[0]?.[0] ?? '—'} color="purple" />
      </div>

      <section className="bg-surface border border-border rounded-xl p-6">
        <h2 className="font-display font-bold text-lg mb-6">Spending by category</h2>
        {isLoading ? (
          <div className="h-32 rounded-lg bg-background animate-pulse" />
        ) : categories.length === 0 ? (
          <div className="text-center py-12 text-muted">
            <p>No spending data for this period.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[520px]">
              <thead>
                <tr className="bg-background/50 border-b border-border text-xs uppercase text-muted">
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium text-right">% of Total</th>
                  <th className="px-4 py-3 font-medium text-right">Transactions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(([category, values]) => (
                  <tr key={category} className="border-b border-border/70">
                    <td className="px-4 py-3 font-medium">{category}</td>
                    <td className="px-4 py-3 text-right font-mono">₹{values.amount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-right">
                      {totalSpent > 0 ? Math.round((values.amount / totalSpent) * 100) : 0}%
                    </td>
                    <td className="px-4 py-3 text-right">{values.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-surface border border-accent/30 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-accent" />
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <h2 className="font-display font-bold text-lg flex items-center gap-2">
              <span aria-hidden="true">🧠</span> AI expense report
            </h2>
            <p className="text-sm text-muted mt-1">Generate insights from the selected period&apos;s totals.</p>
          </div>
          <button
            type="button"
            onClick={() => void generateReport()}
            disabled={isGenerating || periodExpenses.length === 0}
            className="bg-accent hover:bg-accent-dark text-black font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles size={16} />
            {isGenerating ? 'Generating...' : 'Generate AI Report'}
          </button>
        </div>

        {aiReport && (
          <div className="bg-background border border-border rounded-lg p-5 mt-4 whitespace-pre-wrap text-sm text-zinc-300">
            {aiReport}
          </div>
        )}
      </section>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color: 'red' | 'blue' | 'green' | 'purple'
}) {
  const borderColors = {
    red: 'border-l-red-500',
    blue: 'border-l-blue-500',
    green: 'border-l-green-500',
    purple: 'border-l-purple-500',
  }

  return (
    <div className={`bg-surface border border-border p-5 rounded-xl border-l-4 ${borderColors[color]}`}>
      <p className="text-sm text-muted mb-1">{label}</p>
      <p className="font-mono text-xl md:text-2xl font-bold truncate">{value}</p>
    </div>
  )
}
