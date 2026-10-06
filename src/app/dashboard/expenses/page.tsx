'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Plus, Receipt, Search, Trash2 } from 'lucide-react'
import { ExpenseRow } from '@/components/finance'
import Sheet from '@/components/Sheet'
import {
  Alert,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Select,
  Skeleton,
  cx,
} from '@/components/ui'
import { CATEGORIES } from '@/lib/categories'
import { toLocalDateInputValue, type Expense } from '@/lib/expenses'
import { formatINR, formatLongDate } from '@/lib/format'
import { useExpenses } from '@/lib/use-expenses'

const PAGE_SIZE = 40

const emptyForm = () => ({
  description: '',
  amount: '',
  category: 'Food',
  date: toLocalDateInputValue(),
})

export default function ExpensesPage() {
  return (
    <Suspense fallback={null}>
      <ExpensesView />
    </Suspense>
  )
}

function ExpensesView() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { expenses, setExpenses, isLoading, error, setError } = useExpenses()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // `?new=1` (from the tab bar, app shortcut, or Home) opens the add sheet.
  const wantsNew = searchParams.get('new') === '1'
  useEffect(() => {
    if (!wantsNew) return
    setForm(emptyForm())
    setFormError(null)
    setSheetOpen(true)
    router.replace(pathname, { scroll: false })
  }, [wantsNew, pathname, router])

  useEffect(() => {
    if (!pendingDeleteId) return
    const timeout = window.setTimeout(() => setPendingDeleteId(null), 4000)
    return () => window.clearTimeout(timeout)
  }, [pendingDeleteId])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return expenses.filter((expense) => (
      (category === 'All' || expense.category === category)
      && (!needle || expense.description.toLowerCase().includes(needle))
    ))
  }, [category, expenses, query])

  const groups = useMemo(() => groupByDay(filtered.slice(0, visibleCount)), [filtered, visibleCount])
  const filteredTotal = filtered.reduce((total, expense) => total + Number(expense.amount), 0)
  const isFiltered = category !== 'All' || query.trim() !== ''

  const openSheet = () => {
    setForm(emptyForm())
    setFormError(null)
    setSheetOpen(true)
  }

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault()
    const amount = Number(form.amount)
    if (!form.description.trim() || !Number.isFinite(amount) || amount <= 0) {
      setFormError('Enter a description and an amount greater than zero.')
      return
    }

    setSaving(true)
    setFormError(null)
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json() as { expense?: Expense; error?: string }
      if (!response.ok || !data.expense) throw new Error(data.error ?? 'Unable to save the expense.')
      const created = data.expense
      setExpenses((previous) => [created, ...previous].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ))
      setSheetOpen(false)
    } catch (caughtError) {
      setFormError(caughtError instanceof Error ? caughtError.message : 'Unable to save the expense.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    setPendingDeleteId(null)
    setError(null)
    try {
      const response = await fetch(`/api/expenses?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      const data = await response.json() as { error?: string }
      if (!response.ok) throw new Error(data.error ?? 'Unable to delete the expense.')
      setExpenses((previous) => previous.filter((expense) => expense.id !== id))
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to delete the expense.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Expenses"
        description={
          isLoading
            ? 'Loading…'
            : `${filtered.length} ${filtered.length === 1 ? 'expense' : 'expenses'} · ${formatINR(filteredTotal)}${isFiltered ? ' (filtered)' : ''}`
        }
        actions={
          <Button onClick={openSheet} className="max-sm:hidden">
            <Plus size={16} /> Add expense
          </Button>
        }
      />

      {error && <div className="mb-4"><Alert>{error}</Alert></div>}

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle pointer-events-none" />
          <label htmlFor="expense-search" className="sr-only">Search expenses</label>
          <Input
            id="expense-search"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setVisibleCount(PAGE_SIZE)
            }}
            placeholder="Search descriptions"
            className="pl-9"
          />
        </div>
        <label htmlFor="expense-category" className="sr-only">Category</label>
        <Select
          id="expense-category"
          value={category}
          onChange={(event) => {
            setCategory(event.target.value)
            setVisibleCount(PAGE_SIZE)
          }}
          className="sm:w-48"
        >
          <option value="All">All categories</option>
          {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
        </Select>
      </div>

      {isLoading ? (
        <Card className="p-5 space-y-4">
          {[0, 1, 2, 3, 4].map((index) => <Skeleton key={index} className="h-11" />)}
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          {isFiltered ? (
            <EmptyState icon={Search} title="No matching expenses" description="Try a different search or category." />
          ) : (
            <EmptyState
              icon={Receipt}
              title="No expenses yet"
              description="Each expense you record is saved to your account."
              action={<Button size="sm" onClick={openSheet}><Plus size={14} /> Add expense</Button>}
            />
          )}
        </Card>
      ) : (
        <div className="space-y-5">
          {groups.map((group) => (
            <section key={group.day}>
              <div className="flex items-baseline justify-between px-1 mb-2">
                <h2 className="text-xs font-medium text-muted">{group.label}</h2>
                <span className="text-xs text-muted tabular">{formatINR(group.total)}</span>
              </div>
              <Card className="overflow-hidden">
                <ul className="divide-y divide-border">
                  {group.expenses.map((expense) => (
                    <ExpenseRow
                      key={expense.id}
                      expense={expense}
                      trailing={
                        pendingDeleteId === expense.id ? (
                          <Button
                            variant="danger"
                            size="sm"
                            loading={deletingId === expense.id}
                            onClick={() => void handleDelete(expense.id)}
                          >
                            Delete
                          </Button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPendingDeleteId(expense.id)}
                            disabled={deletingId === expense.id}
                            className={cx(
                              'h-8 w-8 -mr-2 rounded-md flex items-center justify-center text-subtle hover:text-negative hover:bg-negative-soft',
                              'disabled:opacity-40',
                            )}
                            aria-label={`Delete ${expense.description}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        )
                      }
                    />
                  ))}
                </ul>
              </Card>
            </section>
          ))}
          {filtered.length > visibleCount && (
            <div className="flex justify-center">
              <Button variant="secondary" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
                Show more ({filtered.length - visibleCount} remaining)
              </Button>
            </div>
          )}
        </div>
      )}

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Add expense"
        footer={
          <div className="flex gap-2 sm:justify-end">
            <Button variant="secondary" onClick={() => setSheetOpen(false)} className="flex-1 sm:flex-none">Cancel</Button>
            <Button type="submit" form="expense-form" loading={saving} className="flex-1 sm:flex-none">Save expense</Button>
          </div>
        }
      >
        <form id="expense-form" onSubmit={handleAdd} className="space-y-4">
          {formError && <Alert>{formError}</Alert>}
          <Field label="Amount" htmlFor="expense-amount">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm pointer-events-none">₹</span>
              <Input
                id="expense-amount"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                max="100000000"
                placeholder="0"
                value={form.amount}
                onChange={(event) => setForm((previous) => ({ ...previous, amount: event.target.value }))}
                className="pl-7 tabular"
                required
                autoFocus
              />
            </div>
          </Field>
          <Field label="Description" htmlFor="expense-description">
            <Input
              id="expense-description"
              placeholder="e.g. Groceries at the market"
              maxLength={160}
              value={form.description}
              onChange={(event) => setForm((previous) => ({ ...previous, description: event.target.value }))}
              required
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category" htmlFor="expense-form-category">
              <Select
                id="expense-form-category"
                value={form.category}
                onChange={(event) => setForm((previous) => ({ ...previous, category: event.target.value }))}
              >
                {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
              </Select>
            </Field>
            <Field label="Date" htmlFor="expense-date">
              <Input
                id="expense-date"
                type="date"
                value={form.date}
                max={toLocalDateInputValue()}
                onChange={(event) => setForm((previous) => ({ ...previous, date: event.target.value }))}
                required
              />
            </Field>
          </div>
        </form>
      </Sheet>
    </div>
  )
}

function groupByDay(expenses: Expense[]) {
  const today = toLocalDateInputValue()
  const yesterday = toLocalDateInputValue(new Date(Date.now() - 86_400_000))
  const groups = new Map<string, { day: string; label: string; total: number; expenses: Expense[] }>()

  for (const expense of expenses) {
    const day = toLocalDateInputValue(new Date(expense.date))
    let group = groups.get(day)
    if (!group) {
      const label = day === today ? 'Today' : day === yesterday ? 'Yesterday' : formatLongDate(day)
      group = { day, label, total: 0, expenses: [] }
      groups.set(day, group)
    }
    group.total += Number(expense.amount)
    group.expenses.push(expense)
  }

  return [...groups.values()]
}
