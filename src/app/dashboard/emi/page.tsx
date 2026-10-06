'use client'

import { useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  CardHeader,
  PageHeader,
  Prose,
  Segmented,
} from '@/components/ui'
import { formatINR } from '@/lib/format'

type ScheduleRow = { label: string; principal: number; interest: number; balance: number }

export default function EMICalculatorPage() {
  const [amount, setAmount] = useState(1_000_000)
  const [rate, setRate] = useState(8.5)
  const [tenure, setTenure] = useState(120)
  const [scheduleView, setScheduleView] = useState<'yearly' | 'monthly'>('yearly')

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const calculation = useMemo(() => {
    const principal = amount
    const monthlyRate = rate / 12 / 100
    const months = tenure

    const emi = monthlyRate === 0
      ? principal / months
      : (principal * monthlyRate * (1 + monthlyRate) ** months) / ((1 + monthlyRate) ** months - 1)
    const totalPayable = emi * months
    const totalInterest = totalPayable - principal

    const monthly: ScheduleRow[] = []
    let balance = principal
    for (let month = 1; month <= months; month++) {
      const interest = balance * monthlyRate
      const principalPart = emi - interest
      balance = Math.max(balance - principalPart, 0)
      monthly.push({ label: `${month}`, principal: principalPart, interest, balance })
    }

    const yearly: ScheduleRow[] = []
    for (let index = 0; index < monthly.length; index += 12) {
      const slice = monthly.slice(index, index + 12)
      yearly.push({
        label: `Year ${index / 12 + 1}`,
        principal: slice.reduce((total, row) => total + row.principal, 0),
        interest: slice.reduce((total, row) => total + row.interest, 0),
        balance: slice.at(-1)?.balance ?? 0,
      })
    }

    return { emi, totalPayable, totalInterest, monthly, yearly }
  }, [amount, rate, tenure])

  const { emi, totalPayable, totalInterest } = calculation
  const principalShare = totalPayable > 0 ? (amount / totalPayable) * 100 : 100
  const rows = scheduleView === 'yearly' ? calculation.yearly : calculation.monthly

  const getAIAnalysis = async () => {
    setIsLoading(true)
    setAiAnalysis(null)
    setAiError(null)

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'emi',
          messages: [{
            role: 'user',
            content: `Loan: ₹${amount.toLocaleString('en-IN')}, EMI: ₹${Math.round(emi).toLocaleString('en-IN')}, tenure: ${tenure} months, rate: ${rate}%. Is this affordable? Give 3 tips.`,
          }],
        }),
      })
      const data = await response.json() as { reply?: string; error?: string }
      if (!response.ok || !data.reply) throw new Error(data.error ?? 'Unable to analyse this loan.')
      setAiAnalysis(data.reply)
    } catch (caughtError) {
      setAiError(caughtError instanceof Error ? caughtError.message : 'Unable to analyse this loan.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Loan calculator" description="Work out the monthly instalment and total cost of a loan." />

      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        <Card className="p-5 sm:p-6 space-y-7">
          <SliderField
            id="loan-amount"
            label="Loan amount"
            value={amount}
            onChange={setAmount}
            min={10_000}
            max={50_000_000}
            step={10_000}
            sliderMax={10_000_000}
            prefix="₹"
            hint={['₹10K', '₹1Cr']}
          />
          <SliderField
            id="loan-rate"
            label="Interest rate"
            value={rate}
            onChange={setRate}
            min={0}
            max={36}
            step={0.05}
            suffix="% p.a."
            hint={['0%', '36%']}
          />
          <SliderField
            id="loan-tenure"
            label="Tenure"
            value={tenure}
            onChange={setTenure}
            min={1}
            max={360}
            step={1}
            suffix="months"
            hint={['1 mo', '30 yrs']}
            detail={tenure >= 12 ? `${(tenure / 12).toFixed(tenure % 12 === 0 ? 0 : 1)} years` : undefined}
          />
        </Card>

        <Card className="p-5 sm:p-6 flex flex-col">
          <p className="text-[13px] text-muted">Monthly instalment</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight tabular">{formatINR(emi)}</p>

          <div className="mt-6">
            <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5" aria-hidden="true">
              <div className="bg-accent rounded-l-full" style={{ width: `${principalShare}%` }} />
              <div className="bg-foreground-2/35 rounded-r-full flex-1" />
            </div>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="flex items-center gap-2 text-foreground-2"><span className="h-2.5 w-2.5 rounded-sm bg-accent" />Principal</dt>
                <dd className="tabular font-medium">{formatINR(amount)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="flex items-center gap-2 text-foreground-2"><span className="h-2.5 w-2.5 rounded-sm bg-foreground-2/35" />Interest</dt>
                <dd className="tabular font-medium">{formatINR(totalInterest)}</dd>
              </div>
              <div className="flex justify-between gap-4 pt-2.5 border-t border-border">
                <dt className="text-foreground-2">Total repayment</dt>
                <dd className="tabular font-semibold">{formatINR(totalPayable)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-muted">
              Interest adds {amount > 0 ? Math.round((totalInterest / amount) * 100) : 0}% on top of what you borrow.
            </p>
          </div>

          <div className="mt-auto pt-6">
            {aiError && <div className="mb-3"><Alert>{aiError}</Alert></div>}
            {aiAnalysis ? (
              <div className="rounded-lg bg-surface-2 border border-border p-4">
                <p className="text-xs font-medium text-muted mb-2">Affordability notes · AI-generated, educational only</p>
                <Prose text={aiAnalysis} />
              </div>
            ) : (
              <Button variant="secondary" className="w-full" loading={isLoading} onClick={() => void getAIAnalysis()}>
                {isLoading ? 'Analysing…' : 'Explain affordability'}
              </Button>
            )}
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader
          title="Repayment schedule"
          description={`${tenure} × ${formatINR(emi)}`}
          action={
            <Segmented
              label="Schedule view"
              value={scheduleView}
              onChange={setScheduleView}
              options={[{ value: 'yearly', label: 'Yearly' }, { value: 'monthly', label: 'Monthly' }]}
            />
          }
        />
        <div className="overflow-x-auto max-h-[480px] overflow-y-auto border-t border-border">
          <table className="w-full text-[13px] sm:text-sm tabular">
            <thead className="sticky top-0 bg-surface-2 text-xs text-muted">
              <tr>
                <th className="px-3 sm:px-5 py-2.5 text-left font-medium">{scheduleView === 'yearly' ? 'Period' : 'Month'}</th>
                <th className="px-3 sm:px-5 py-2.5 text-right font-medium">Principal</th>
                <th className="px-3 sm:px-5 py-2.5 text-right font-medium">Interest</th>
                <th className="px-3 sm:px-5 py-2.5 text-right font-medium">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.label} className="hover:bg-surface-2/60">
                  <td className="px-3 sm:px-5 py-2.5 text-foreground-2">{row.label}</td>
                  <td className="px-3 sm:px-5 py-2.5 text-right">{formatINR(row.principal)}</td>
                  <td className="px-3 sm:px-5 py-2.5 text-right text-muted">{formatINR(row.interest)}</td>
                  <td className="px-3 sm:px-5 py-2.5 text-right font-medium">{formatINR(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function SliderField({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step,
  sliderMax = max,
  prefix,
  suffix,
  hint,
  detail,
}: {
  id: string
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  sliderMax?: number
  prefix?: string
  suffix?: string
  hint: [string, string]
  detail?: string
}) {
  const [draft, setDraft] = useState<string | null>(null)

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <label htmlFor={id} className="text-[13px] font-medium text-foreground-2">
          {label}
          {detail && <span className="font-normal text-muted"> · {detail}</span>}
        </label>
        <div className="flex items-center h-9 rounded-lg border border-border bg-surface px-2.5 focus-within:border-accent w-40">
          {prefix && <span className="text-sm text-muted mr-1">{prefix}</span>}
          <input
            id={id}
            type="number"
            inputMode="decimal"
            value={draft ?? String(value)}
            min={min}
            max={max}
            step={step}
            onChange={(event) => {
              setDraft(event.target.value)
              const next = Number(event.target.value)
              if (event.target.value !== '' && Number.isFinite(next) && next >= min && next <= max) onChange(next)
            }}
            onBlur={() => setDraft(null)}
            className="w-full min-w-0 bg-transparent text-sm font-medium text-right tabular focus:outline-none"
          />
          {suffix && <span className="text-xs text-muted ml-1.5 whitespace-nowrap">{suffix}</span>}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={sliderMax}
        step={step}
        value={Math.min(value, sliderMax)}
        onChange={(event) => {
          setDraft(null)
          onChange(Number(event.target.value))
        }}
        className="mt-3 w-full accent-accent"
        aria-label={`${label} slider`}
      />
      <div className="flex justify-between text-[11px] text-subtle">
        <span>{hint[0]}</span>
        <span>{hint[1]}</span>
      </div>
    </div>
  )
}
