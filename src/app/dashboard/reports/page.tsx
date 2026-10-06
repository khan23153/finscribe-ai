'use client'

import { useMemo, useState } from 'react'
import { FileText, PieChart } from 'lucide-react'
import { CategoryBreakdown } from '@/components/finance'
import {
  Alert,
  Button,
  Card,
  CardHeader,
  EmptyState,
  PageHeader,
  Prose,
  Segmented,
  Skeleton,
  Stat,
} from '@/components/ui'
import { startOfPeriod } from '@/lib/expenses'
import { formatINR, formatShortDate } from '@/lib/format'
import { useExpenses } from '@/lib/use-expenses'

const periods = ['This Week', 'This Month', 'Last 3 Months', 'This Year'] as const
type Period = typeof periods[number]

const periodLabels: Record<Period, string> = {
  'This Week': 'Week',
  'This Month': 'Month',
  'Last 3 Months': '3 months',
  'This Year': 'Year',
}

export default function ReportsPage() {
  const [activePeriod, setActivePeriod] = useState<Period>('This Month')
  const { expenses, isLoading, error } = useExpenses()
  const [aiReport, setAiReport] = useState('')
  const [aiError, setAiError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const periodExpenses = useMemo(() => {
    const start = startOfPeriod(activePeriod)
    return expenses.filter((expense) => new Date(expense.date) >= start)
  }, [activePeriod, expenses])

  const totalSpent = periodExpenses.reduce((total, expense) => total + Number(expense.amount), 0)
  const averageTransaction = periodExpenses.length > 0 ? totalSpent / periodExpenses.length : 0
  const largest = periodExpenses.reduce<(typeof periodExpenses)[number] | null>(
    (current, expense) => (!current || Number(expense.amount) > Number(current.amount) ? expense : current),
    null,
  )

  const categories = useMemo(() => Object.entries(
    periodExpenses.reduce<Record<string, { amount: number; count: number }>>((totals, expense) => {
      const current = totals[expense.category] ?? { amount: 0, count: 0 }
      totals[expense.category] = { amount: current.amount + Number(expense.amount), count: current.count + 1 }
      return totals
    }, {}),
  )
    .map(([category, values]) => ({ category, ...values }))
    .sort((a, b) => b.amount - a.amount), [periodExpenses])

  const changePeriod = (period: Period) => {
    setActivePeriod(period)
    setAiReport('')
    setAiError(null)
  }

  const generateReport = async () => {
    if (periodExpenses.length === 0) return

    setIsGenerating(true)
    setAiReport('')
    setAiError(null)

    try {
      const categorySummary = categories
        .map(({ category, amount, count }) => `${category}: ₹${amount.toFixed(2)} (${count} transactions)`)
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
      const data = await response.json() as { reply?: string; error?: string }
      if (!response.ok || !data.reply) throw new Error(data.error ?? 'Unable to generate the summary.')
      setAiReport(data.reply)
    } catch (caughtError) {
      setAiError(caughtError instanceof Error ? caughtError.message : 'Unable to generate the summary.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reports"
        description="Totals and patterns from the expenses you have recorded."
        actions={
          <Segmented
            label="Period"
            value={activePeriod}
            onChange={changePeriod}
            options={periods.map((period) => ({ value: period, label: periodLabels[period] }))}
          />
        }
      />

      {error && <Alert>{error}</Alert>}

      <Card className="overflow-hidden grid grid-cols-2 lg:grid-cols-4 gap-px bg-border [&>*]:bg-surface [&>*]:p-5">
        {isLoading ? (
          [0, 1, 2, 3].map((index) => <div key={index}><Skeleton className="h-4 w-20" /><Skeleton className="h-7 w-28 mt-2" /></div>)
        ) : (
          <>
            <Stat label="Total spent" value={formatINR(totalSpent)} />
            <Stat label="Transactions" value={periodExpenses.length} />
            <Stat label="Average" value={formatINR(averageTransaction)} detail="per transaction" />
            <Stat
              label="Largest"
              value={largest ? formatINR(Number(largest.amount)) : '—'}
              detail={largest ? `${largest.description} · ${formatShortDate(largest.date)}` : undefined}
            />
          </>
        )}
      </Card>

      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader title="By category" description="Share of spending in this period" />
          <div className="px-5 pb-5 pt-2">
            {isLoading ? (
              <div className="space-y-4">{[0, 1, 2, 3].map((index) => <Skeleton key={index} className="h-7" />)}</div>
            ) : categories.length === 0 ? (
              <EmptyState icon={PieChart} title="No spending in this period" description="Pick a longer period or record an expense." />
            ) : (
              <CategoryBreakdown rows={categories} total={totalSpent} />
            )}
          </div>
        </Card>

        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader
            title="Written summary"
            description="Observations generated from this period's totals"
          />
          <div className="px-5 pb-5 pt-1 flex-1 flex flex-col">
            {aiError && <div className="mb-3"><Alert>{aiError}</Alert></div>}
            {aiReport ? (
              <>
                <Prose text={aiReport} />
                <p className="mt-4 text-xs text-muted">Generated by AI from category totals only. Check figures before acting on them.</p>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-start justify-center rounded-lg border border-dashed border-border p-4">
                <FileText size={18} className="text-muted" />
                <p className="mt-2 text-[13px] text-foreground-2">
                  Get three observations and two recommendations based on your {periodLabels[activePeriod].toLowerCase()} totals.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  loading={isGenerating}
                  disabled={periodExpenses.length === 0}
                  onClick={() => void generateReport()}
                >
                  {isGenerating ? 'Writing…' : 'Generate summary'}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
