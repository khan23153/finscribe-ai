'use client'

import { useState } from 'react'
import { z } from 'zod'
import { toLocalDateInputValue } from '@/lib/expenses'
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
const icons = ['🏠', '🚗', '✈️', '📱', '💍', '🎓', '🏦', '💻']

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
  const [goals, setGoals] = useLocalStorageJson(
    'finscribe-goals',
    initialGoals,
    parseGoals,
  )
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [current, setCurrent] = useState('')
  const [deadline, setDeadline] = useState(defaultDeadline)
  const [icon, setIcon] = useState('🏠')
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null)
  const [addAmount, setAddAmount] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleAddGoal = (event: React.FormEvent) => {
    event.preventDefault()

    const targetValue = Number(target)
    const currentValue = current ? Number(current) : 0
    const parsedDeadline = new Date(`${deadline}T23:59:59`)
    if (
      !name.trim()
      || !Number.isFinite(targetValue)
      || targetValue <= 0
      || !Number.isFinite(currentValue)
      || currentValue < 0
      || Number.isNaN(parsedDeadline.getTime())
    ) {
      setError('Enter a name, valid deadline, and non-negative amounts.')
      return
    }

    const newGoal: Goal = {
      id: crypto.randomUUID(),
      name: name.trim(),
      target: targetValue,
      current: Math.min(currentValue, targetValue),
      deadline,
      icon,
      createdAt: new Date().toISOString(),
    }

    setGoals((previous) => [...previous, newGoal])
    setName('')
    setTarget('')
    setCurrent('')
    setDeadline(defaultDeadline())
    setError(null)
  }

  const handleAddMoney = (event: React.FormEvent) => {
    event.preventDefault()
    const amount = Number(addAmount)

    if (!activeGoalId || !Number.isFinite(amount) || amount <= 0) {
      setError('Enter a positive amount to add.')
      return
    }

    setGoals((previous) => previous.map((goal) => (
      goal.id === activeGoalId
        ? { ...goal, current: Math.min(goal.current + amount, goal.target) }
        : goal
    )))
    setAddAmount('')
    setActiveGoalId(null)
    setError(null)
  }

  const removeGoal = (id: string) => {
    setGoals((previous) => previous.filter((goal) => goal.id !== id))
    if (activeGoalId === id) setActiveGoalId(null)
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8">
      <section className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl text-zinc-100">
        <div className="mb-4">
          <h1 className="text-xl font-bold">Add New Goal</h1>
          <p className="text-xs text-zinc-500 mt-1">Goals are saved in this browser.</p>
        </div>

        {error && (
          <p role="alert" className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <form onSubmit={handleAddGoal} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4 items-end">
          <div className="flex flex-col col-span-2">
            <label htmlFor="goal-name" className="text-xs text-zinc-400 mb-1">Goal Name</label>
            <input
              id="goal-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              placeholder="e.g. Dream Car"
              maxLength={80}
              required
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="goal-target" className="text-xs text-zinc-400 mb-1">Target (₹)</label>
            <input
              id="goal-target"
              type="number"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              placeholder="100000"
              min="0.01"
              max="1000000000"
              step="0.01"
              required
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="goal-current" className="text-xs text-zinc-400 mb-1">Current (₹)</label>
            <input
              id="goal-current"
              type="number"
              value={current}
              onChange={(event) => setCurrent(event.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              placeholder="0"
              min="0"
              max="1000000000"
              step="0.01"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="goal-deadline" className="text-xs text-zinc-400 mb-1">Deadline</label>
            <input
              id="goal-deadline"
              type="date"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              required
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="goal-icon" className="text-xs text-zinc-400 mb-1">Icon</label>
            <select
              id="goal-icon"
              value={icon}
              onChange={(event) => setIcon(event.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-500 text-xl text-center"
            >
              {icons.map((goalIcon) => (
                <option key={goalIcon} value={goalIcon}>{goalIcon}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="md:col-span-6 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors w-full"
          >
            Set Goal
          </button>
        </form>
      </section>

      {goals.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-zinc-500">
          <p>No goals yet. Set your first goal!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const progress = Math.min((goal.current / goal.target) * 100, 100)
            const status = getGoalStatus(goal, progress)

            return (
              <article key={goal.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
                <div className="flex justify-between items-start gap-4 mb-6">
                  <div className="flex items-center space-x-4 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-2xl border border-zinc-700 shadow-sm shrink-0">
                      {goal.icon}
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-bold text-lg text-zinc-100 truncate">{goal.name}</h2>
                      <p className="text-xs text-zinc-400">Target: {formatDeadline(goal.deadline)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                      status === 'Behind'
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : 'bg-green-500/10 text-green-400 border-green-500/20'
                    }`}>
                      {status}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeGoal(goal.id)}
                      className="text-xs text-zinc-500 hover:text-red-400"
                      aria-label={`Remove ${goal.name}`}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm gap-3">
                    <span className="text-zinc-400">Progress</span>
                    <span className="font-mono font-medium text-zinc-300 text-right">
                      <span className="text-zinc-100">₹{goal.current.toLocaleString('en-IN')}</span>
                      <span className="text-zinc-500 mx-1">of</span>
                      ₹{goal.target.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-right text-xs text-zinc-500 font-mono">
                    {progress.toFixed(1)}%
                  </div>
                </div>

                {activeGoalId === goal.id ? (
                  <form onSubmit={handleAddMoney} className="flex space-x-2 pt-2 border-t border-zinc-800/50">
                    <label htmlFor={`goal-add-${goal.id}`} className="sr-only">Amount to add</label>
                    <input
                      id={`goal-add-${goal.id}`}
                      type="number"
                      value={addAmount}
                      onChange={(event) => setAddAmount(event.target.value)}
                      className="min-w-0 flex-1 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-green-500"
                      placeholder="Amount to add"
                      min="0.01"
                      max="1000000000"
                      step="0.01"
                      required
                    />
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 rounded-md transition-colors">
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveGoalId(null)}
                      className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium px-4 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveGoalId(goal.id)}
                    disabled={progress >= 100}
                    className="w-full text-center py-2.5 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {progress >= 100 ? 'Goal Reached!' : '+ Add Money'}
                  </button>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

function getGoalStatus(goal: Goal, progress: number) {
  if (progress >= 100) return 'Complete'

  const createdAt = new Date(goal.createdAt).getTime()
  const deadline = new Date(`${goal.deadline}T23:59:59`).getTime()
  const now = Date.now()

  if (!Number.isFinite(createdAt) || !Number.isFinite(deadline) || deadline <= createdAt) {
    return now <= deadline ? 'On Track' : 'Behind'
  }

  const elapsedPercent = Math.min(
    Math.max(((now - createdAt) / (deadline - createdAt)) * 100, 0),
    100,
  )
  return progress >= elapsedPercent ? 'On Track' : 'Behind'
}

function formatDeadline(value: string) {
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-IN')
}
