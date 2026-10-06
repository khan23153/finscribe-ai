'use client'

import { createElement, useState } from 'react'
import { z } from 'zod'
import {
  Car,
  Gem,
  GraduationCap,
  Home,
  Landmark,
  Laptop,
  Plane,
  Plus,
  Smartphone,
  Target,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import Sheet from '@/components/Sheet'
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  PageHeader,
  cx,
} from '@/components/ui'
import { toLocalDateInputValue } from '@/lib/expenses'
import { formatINR, formatLongDate } from '@/lib/format'
import { useClientNow } from '@/lib/use-client-now'
import { useLocalStorageJson } from '@/lib/use-local-storage'

const goalSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(80),
  target: z.number().finite().positive(),
  current: z.number().finite().nonnegative(),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  icon: z.string().min(1).max(8),
  createdAt: z.string().datetime(),
}).strict()

const goalListSchema = z.array(goalSchema).max(100)
type Goal = z.infer<typeof goalSchema>

const initialGoals: Goal[] = []

const goalIcons: Array<{ key: string; label: string; icon: LucideIcon }> = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'car', label: 'Vehicle', icon: Car },
  { key: 'plane', label: 'Travel', icon: Plane },
  { key: 'phone', label: 'Phone', icon: Smartphone },
  { key: 'laptop', label: 'Computer', icon: Laptop },
  { key: 'school', label: 'Education', icon: GraduationCap },
  { key: 'ring', label: 'Wedding', icon: Gem },
  { key: 'bank', label: 'Savings', icon: Landmark },
]

// Goals saved before the redesign stored an emoji.
const legacyIcons: Record<string, string> = {
  '🏠': 'home', '🚗': 'car', '✈️': 'plane', '📱': 'phone',
  '💍': 'ring', '🎓': 'school', '🏦': 'bank', '💻': 'laptop',
}

function iconFor(key: string) {
  const normalized = legacyIcons[key] ?? key
  return goalIcons.find((item) => item.key === normalized)?.icon ?? Target
}

function parseGoals(value: unknown) {
  const result = goalListSchema.safeParse(value)
  return result.success ? result.data : undefined
}

function defaultDeadline() {
  const date = new Date()
  date.setMonth(date.getMonth() + 6)
  return toLocalDateInputValue(date)
}

export default function GoalsPage() {
  const [goals, setGoals] = useLocalStorageJson('finscribe-goals', initialGoals, parseGoals)
  const now = useClientNow()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [current, setCurrent] = useState('')
  const [deadline, setDeadline] = useState('')
  const [icon, setIcon] = useState('home')
  const [formError, setFormError] = useState<string | null>(null)

  const [activeGoalId, setActiveGoalId] = useState<string | null>(null)
  const [addAmount, setAddAmount] = useState('')

  const openSheet = () => {
    setName('')
    setTarget('')
    setCurrent('')
    setDeadline(defaultDeadline())
    setIcon('home')
    setFormError(null)
    setSheetOpen(true)
  }

  const handleAddGoal = (event: React.FormEvent) => {
    event.preventDefault()
    const targetValue = Number(target)
    const currentValue = current ? Number(current) : 0
    const parsedDeadline = new Date(`${deadline}T23:59:59`)

    if (
      !name.trim()
      || !Number.isFinite(targetValue) || targetValue <= 0
      || !Number.isFinite(currentValue) || currentValue < 0
      || Number.isNaN(parsedDeadline.getTime())
    ) {
      setFormError('Enter a name, a target above zero, and a valid date.')
      return
    }

    setGoals((previous) => [...previous, {
      id: crypto.randomUUID(),
      name: name.trim(),
      target: targetValue,
      current: Math.min(currentValue, targetValue),
      deadline,
      icon,
      createdAt: new Date().toISOString(),
    }])
    setSheetOpen(false)
  }

  const handleAddMoney = (event: React.FormEvent, goalId: string) => {
    event.preventDefault()
    const amount = Number(addAmount)
    if (!Number.isFinite(amount) || amount <= 0) return

    setGoals((previous) => previous.map((goal) => (
      goal.id === goalId ? { ...goal, current: Math.min(goal.current + amount, goal.target) } : goal
    )))
    setAddAmount('')
    setActiveGoalId(null)
  }

  const removeGoal = (id: string) => {
    setGoals((previous) => previous.filter((goal) => goal.id !== id))
    if (activeGoalId === id) setActiveGoalId(null)
  }

  const totalSaved = goals.reduce((total, goal) => total + goal.current, 0)
  const totalTarget = goals.reduce((total, goal) => total + goal.target, 0)

  return (
    <div>
      <PageHeader
        title="Goals"
        description={
          goals.length > 0
            ? `${formatINR(totalSaved)} saved of ${formatINR(totalTarget)} across ${goals.length} ${goals.length === 1 ? 'goal' : 'goals'}`
            : 'Set savings targets and track progress. Stored on this device.'
        }
        actions={<Button onClick={openSheet}><Plus size={16} /> New goal</Button>}
      />

      {goals.length === 0 ? (
        <Card>
          <EmptyState
            icon={Target}
            title="No goals yet"
            description="A goal with a date tells you how much to set aside each month."
            action={<Button size="sm" onClick={openSheet}><Plus size={14} /> Create a goal</Button>}
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((goal) => {
            const progress = Math.min((goal.current / goal.target) * 100, 100)
            const status = now ? getGoalStatus(goal, progress, now) : null
            const monthsLeft = now ? monthsUntil(goal.deadline, now) : null
            const remaining = goal.target - goal.current
            const monthly = monthsLeft && monthsLeft > 0 ? remaining / monthsLeft : null

            return (
              <Card key={goal.id} className="p-5 flex flex-col">
                <div className="flex items-start gap-3">
                  <span className="h-10 w-10 shrink-0 rounded-lg bg-accent-soft text-accent flex items-center justify-center">
                    {createElement(iconFor(goal.icon), { size: 18 })}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-[15px] font-semibold truncate">{goal.name}</h2>
                      {status && (
                        <Badge tone={status === 'Behind' ? 'warning' : 'positive'}>{status}</Badge>
                      )}
                    </div>
                    <p className="text-[13px] text-muted mt-0.5">
                      By {formatLongDate(goal.deadline)}
                      {monthsLeft !== null && progress < 100 && (
                        <> · {monthsLeft > 0 ? `${monthsLeft} ${monthsLeft === 1 ? 'month' : 'months'} left` : 'Past due'}</>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeGoal(goal.id)}
                    className="h-8 w-8 -mr-2 -mt-1 rounded-md flex items-center justify-center text-subtle hover:text-negative hover:bg-negative-soft"
                    aria-label={`Remove ${goal.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="mt-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-xl font-semibold tracking-tight tabular">{formatINR(goal.current)}</p>
                    <p className="text-[13px] text-muted tabular">of {formatINR(goal.target)}</p>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-surface-2 overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label={`${goal.name} progress`}>
                    <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    {progress >= 100
                      ? 'Target reached.'
                      : monthly
                        ? `${Math.round(progress)}% there · save about ${formatINR(monthly)}/month to finish on time`
                        : `${Math.round(progress)}% there`}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  {activeGoalId === goal.id ? (
                    <form onSubmit={(event) => handleAddMoney(event, goal.id)} className="flex gap-2">
                      <label htmlFor={`goal-add-${goal.id}`} className="sr-only">Amount to add</label>
                      <Input
                        id={`goal-add-${goal.id}`}
                        type="number"
                        inputMode="decimal"
                        value={addAmount}
                        onChange={(event) => setAddAmount(event.target.value)}
                        placeholder="Amount"
                        min="0.01"
                        max="1000000000"
                        step="0.01"
                        className="h-9"
                        autoFocus
                        required
                      />
                      <Button type="submit">Add</Button>
                      <Button variant="ghost" onClick={() => setActiveGoalId(null)}>Cancel</Button>
                    </form>
                  ) : (
                    <Button
                      variant="secondary"
                      className="w-full"
                      disabled={progress >= 100}
                      onClick={() => {
                        setAddAmount('')
                        setActiveGoalId(goal.id)
                      }}
                    >
                      {progress >= 100 ? 'Completed' : 'Add savings'}
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="New goal"
        footer={
          <div className="flex gap-2 sm:justify-end">
            <Button variant="secondary" onClick={() => setSheetOpen(false)} className="flex-1 sm:flex-none">Cancel</Button>
            <Button type="submit" form="goal-form" className="flex-1 sm:flex-none">Create goal</Button>
          </div>
        }
      >
        <form id="goal-form" onSubmit={handleAddGoal} className="space-y-4">
          {formError && <Alert>{formError}</Alert>}
          <Field label="Name" htmlFor="goal-name">
            <Input id="goal-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Emergency fund" maxLength={80} required autoFocus />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Target (₹)" htmlFor="goal-target">
              <Input id="goal-target" type="number" inputMode="decimal" value={target} onChange={(event) => setTarget(event.target.value)} placeholder="100000" min="0.01" max="1000000000" step="0.01" required />
            </Field>
            <Field label="Already saved (₹)" htmlFor="goal-current">
              <Input id="goal-current" type="number" inputMode="decimal" value={current} onChange={(event) => setCurrent(event.target.value)} placeholder="0" min="0" max="1000000000" step="0.01" />
            </Field>
          </div>
          <Field label="Target date" htmlFor="goal-deadline">
            <Input id="goal-deadline" type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} required />
          </Field>
          <fieldset>
            <legend className="text-[13px] font-medium text-foreground-2 mb-1.5">Icon</legend>
            <div className="grid grid-cols-8 gap-1.5">
              {goalIcons.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setIcon(item.key)}
                  aria-pressed={icon === item.key}
                  aria-label={item.label}
                  title={item.label}
                  className={cx(
                    'aspect-square rounded-lg border flex items-center justify-center transition-colors',
                    icon === item.key
                      ? 'border-accent bg-accent-soft text-accent'
                      : 'border-border text-muted hover:text-foreground hover:border-border-strong',
                  )}
                >
                  {createElement(item.icon, { size: 17 })}
                </button>
              ))}
            </div>
          </fieldset>
        </form>
      </Sheet>
    </div>
  )
}

function monthsUntil(deadline: string, now: Date) {
  const end = new Date(`${deadline}T23:59:59`)
  if (Number.isNaN(end.getTime())) return null
  const months = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth())
  return end < now ? 0 : Math.max(months, 1)
}

function getGoalStatus(goal: Goal, progress: number, now: Date) {
  if (progress >= 100) return 'Complete'

  const createdAt = new Date(goal.createdAt).getTime()
  const deadline = new Date(`${goal.deadline}T23:59:59`).getTime()
  const time = now.getTime()

  if (!Number.isFinite(createdAt) || !Number.isFinite(deadline) || deadline <= createdAt) {
    return time <= deadline ? 'On track' : 'Behind'
  }

  const elapsedPercent = Math.min(Math.max(((time - createdAt) / (deadline - createdAt)) * 100, 0), 100)
  return progress >= elapsedPercent ? 'On track' : 'Behind'
}
