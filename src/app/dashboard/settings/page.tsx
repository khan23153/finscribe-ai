'use client'

import type { ReactNode } from 'react'
import { useClerk, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { ChevronRight, LogOut } from 'lucide-react'
import InstallApp from '@/components/InstallApp'
import { ThemeSwitcher } from '@/components/ThemeToggle'
import { Button, Card, Input, PageHeader, Switch } from '@/components/ui'
import { useLocalStorageValue } from '@/lib/use-local-storage'

export default function SettingsPage() {
  const { user } = useUser()
  const { openUserProfile, signOut } = useClerk()

  const [income, setIncome] = useLocalStorageValue('finscribe-income', '')
  const [budget, setBudget] = useLocalStorageValue('finscribe-budget', '')
  const [weeklyReport, setWeeklyReport] = useLocalStorageValue('finscribe-weekly-report', 'true')
  const [budgetAlerts, setBudgetAlerts] = useLocalStorageValue('finscribe-budget-alerts', 'false')
  const [monthlyReport, setMonthlyReport] = useLocalStorageValue('finscribe-monthly-report', 'true')

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" />

      <div className="space-y-6">
        <Card className="p-5 flex items-center gap-4">
          {user?.imageUrl ? (
            // Clerk serves avatars from its own CDN; next/image would need remote config for little benefit.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.imageUrl} alt="" className="h-12 w-12 rounded-full object-cover border border-border" />
          ) : (
            <span className="h-12 w-12 rounded-full bg-surface-2 border border-border" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold truncate">{user?.fullName || user?.firstName || 'Your account'}</p>
            <p className="text-[13px] text-muted truncate">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => openUserProfile()}>Manage</Button>
        </Card>

        <Section title="Budget" description="Used on Home to show how much of your month is left. Stored on this device.">
          <Row label="Monthly income" htmlFor="settings-income">
            <AmountInput id="settings-income" value={income} onChange={setIncome} />
          </Row>
          <Row label="Monthly spending budget" htmlFor="settings-budget">
            <AmountInput id="settings-budget" value={budget} onChange={setBudget} />
          </Row>
        </Section>

        <Section title="Appearance">
          <Row label="Theme">
            <ThemeSwitcher />
          </Row>
          <Row label="Currency">
            <span className="text-[13px] text-muted">Indian rupee (₹)</span>
          </Row>
        </Section>

        <Section title="App">
          <Row label="Install app" description="Open FinScribe from your home screen.">
            <InstallApp />
          </Row>
          <Row label="Financial profile" description="Retake the setup questions.">
            <Link href="/onboarding/quiz" className="text-[13px] font-medium text-accent inline-flex items-center gap-0.5 hover:underline">
              Retake <ChevronRight size={14} />
            </Link>
          </Row>
        </Section>

        <Section title="Notifications" description="Delivery isn't available yet. Your choices are saved for when it is.">
          <Row label="Weekly spending summary">
            <Switch label="Weekly spending summary" checked={weeklyReport === 'true'} onChange={(checked) => setWeeklyReport(String(checked))} />
          </Row>
          <Row label="Budget alerts at 80%">
            <Switch label="Budget alerts" checked={budgetAlerts === 'true'} onChange={(checked) => setBudgetAlerts(String(checked))} />
          </Row>
          <Row label="Monthly report">
            <Switch label="Monthly report" checked={monthlyReport === 'true'} onChange={(checked) => setMonthlyReport(String(checked))} />
          </Row>
        </Section>

        <Card className="p-1">
          <button
            type="button"
            onClick={() => signOut({ redirectUrl: '/' })}
            className="w-full h-11 px-4 rounded-lg flex items-center gap-2.5 text-sm font-medium text-negative hover:bg-negative-soft"
          >
            <LogOut size={16} /> Sign out
          </button>
        </Card>
      </div>
    </div>
  )
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-[13px] font-semibold text-foreground px-1">{title}</h2>
      {description && <p className="text-[13px] text-muted px-1 mt-0.5">{description}</p>}
      <Card className="mt-2.5 divide-y divide-border">{children}</Card>
    </section>
  )
}

function Row({
  label,
  description,
  htmlFor,
  children,
}: {
  label: string
  description?: string
  htmlFor?: string
  children: ReactNode
}) {
  const LabelTag = htmlFor ? 'label' : 'p'
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5 min-h-14">
      <div className="min-w-0">
        <LabelTag htmlFor={htmlFor} className="text-sm text-foreground block">{label}</LabelTag>
        {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0 flex justify-end">{children}</div>
    </div>
  )
}

function AmountInput({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="relative w-36">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted pointer-events-none">₹</span>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="0"
        min="0"
        max="1000000000"
        step="1"
        className="pl-7 h-9 text-right tabular"
      />
    </div>
  )
}
