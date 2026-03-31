'use client'

import { useState } from 'react'

type Goal = {
  id: string
  name: string
  target: number
  current: number
  deadline: string
  icon: string
}

const initialGoals: Goal[] = []

const icons = ["🏠", "🚗", "✈️", "📱", "💍", "🎓", "🏦", "💻", "🎉"]

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>(initialGoals)

  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [current, setCurrent] = useState('')
  const [deadline, setDeadline] = useState(new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0])
  const [icon, setIcon] = useState('🏠')

  const [activeGoalId, setActiveGoalId] = useState<string | null>(null)
  const [addAmount, setAddAmount] = useState('')

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !target) return
    const newGoal: Goal = {
      id: Date.now().toString(),
      name,
      target: parseFloat(target),
      current: current ? parseFloat(current) : 0,
      deadline,
      icon
    }
    setGoals([...goals, newGoal])
    setName('')
    setTarget('')
    setCurrent('')
  }

  const handleAddMoney = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeGoalId || !addAmount) return

    const amount = parseFloat(addAmount)
    setGoals(goals.map(g => {
      if (g.id === activeGoalId) {
        return { ...g, current: Math.min(g.current + amount, g.target) }
      }
      return g
    }))

    setAddAmount('')
    setActiveGoalId(null)
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8">
      {/* SECTION A - Add Goal Form */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl text-zinc-100">
        <h2 className="text-xl font-bold mb-4">Add New Goal</h2>
        <form onSubmit={handleAddGoal} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4 items-end">
          <div className="flex flex-col col-span-2">
            <label className="text-xs text-zinc-400 mb-1">Goal Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              placeholder="e.g. Dream Car"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-zinc-400 mb-1">Target (₹)</label>
            <input
              type="number"
              value={target}
              onChange={e => setTarget(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              placeholder="100000" min="1"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-zinc-400 mb-1">Current (₹)</label>
            <input
              type="number"
              value={current}
              onChange={e => setCurrent(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              placeholder="0" min="0"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-zinc-400 mb-1">Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-zinc-400 mb-1">Icon</label>
            <select
              value={icon}
              onChange={e => setIcon(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-500 text-xl text-center"
            >
              {icons.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <button
            type="submit"
            className="md:col-span-6 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors w-full"
          >
            Set Goal
          </button>
        </form>
      </div>

      {/* SECTION B - Goal Cards */}
      {goals.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-zinc-500">
          <p>No goals yet. Set your first goal!</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map(goal => {
          const progress = Math.min((goal.current / goal.target) * 100, 100)

          // Simple on track logic: if time elapsed % > progress %, then behind
          const today = new Date().getTime()
          const deadlineDate = new Date(goal.deadline).getTime()
          // assume created 6 months ago for mock simplicity
          const createdDate = new Date().setMonth(new Date().getMonth() - 6)
          const totalTime = deadlineDate - createdDate
          const elapsedTime = today - createdDate
          const timePercent = Math.min((elapsedTime / totalTime) * 100, 100)

          const onTrack = progress >= timePercent

          return (
            <div key={goal.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-2xl border border-zinc-700 shadow-sm">
                    {goal.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-zinc-100">{goal.name}</h3>
                    <p className="text-xs text-zinc-400">Target: {new Date(goal.deadline).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className={`text-xs px-2.5 py-1 rounded-full font-medium ${onTrack ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {onTrack ? 'On Track 🟢' : 'Behind 🔴'}
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Progress</span>
                  <span className="font-mono font-medium text-zinc-300">
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
                  <input
                    type="number"
                    value={addAmount}
                    onChange={e => setAddAmount(e.target.value)}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-green-500"
                    placeholder="Amount to add" min="1" required
                  />
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 rounded-md transition-colors"
                  >
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
                  onClick={() => setActiveGoalId(goal.id)}
                  disabled={progress >= 100}
                  className="w-full text-center py-2.5 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {progress >= 100 ? 'Goal Reached! 🎉' : '+ Add Money'}
                </button>
              )}
            </div>
          )
        })}
      </div>
      )}
    </div>
  )
}
