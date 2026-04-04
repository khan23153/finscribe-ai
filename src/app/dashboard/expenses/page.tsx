'use client'

import { useState, useEffect } from 'react'

type Expense = {
  id: string
  description: string
  amount: number
  category: string
  date: string
}

const CATEGORIES = [
  'Food', 'Transport', 'Shopping',
  'Bills', 'Entertainment', 'Health', 'Other'
]

const categoryColors: Record<string, string> = {
  Food: 'bg-green-500/20 text-green-400',
  Transport: 'bg-blue-500/20 text-blue-400',
  Shopping: 'bg-yellow-500/20 text-yellow-400',
  Bills: 'bg-red-500/20 text-red-400',
  Entertainment: 'bg-purple-500/20 text-purple-400',
  Health: 'bg-pink-500/20 text-pink-400',
  Other: 'bg-zinc-500/20 text-zinc-400',
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All')
  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/expenses')
      const data = await res.json()
      setExpenses(data.expenses || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!form.description || !form.amount) return
    setSaving(true)
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.expense) {
        setExpenses(prev => [data.expense, ...prev])
        setForm({
          description: '',
          amount: '',
          category: 'Food',
          date: new Date().toISOString().split('T')[0]
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/expenses?id=${id}`, {
        method: 'DELETE'
      })
      setExpenses(prev => prev.filter(e => e.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = activeFilter === 'All'
    ? expenses
    : expenses.filter(e => e.category === activeFilter)

  const total = expenses.reduce(
    (sum, e) => sum + Number(e.amount), 0
  )

  const biggestCat = expenses.length > 0
    ? Object.entries(
        expenses.reduce((acc, e) => {
          acc[e.category] = (acc[e.category] || 0) + Number(e.amount)
          return acc
        }, {} as Record<string, number>)
      ).sort((a, b) => b[1] - a[1])[0]?.[0]
    : null

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Expenses
        </h1>
        <p className="text-zinc-400 text-sm">
          Track your daily spending
        </p>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-400 text-xs">Total</p>
          <p className="text-red-400 font-mono text-lg font-bold">
            ₹{total.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-400 text-xs">Top Category</p>
          <p className="text-white text-sm font-semibold truncate">
            {biggestCat || '—'}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-400 text-xs">Count</p>
          <p className="text-white font-mono text-lg font-bold">
            {expenses.length}
          </p>
        </div>
      </div>

      {/* Add Form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
        <h2 className="text-white font-semibold">
          Add New Expense
        </h2>
        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={e => setForm(p => ({
            ...p, description: e.target.value
          }))}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-green-500"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Amount (₹)"
            value={form.amount}
            onChange={e => setForm(p => ({
              ...p, amount: e.target.value
            }))}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-green-500"
          />
          <select
            value={form.category}
            onChange={e => setForm(p => ({
              ...p, category: e.target.value
            }))}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <input
          type="date"
          value={form.date}
          onChange={e => setForm(p => ({
            ...p, date: e.target.value
          }))}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
        />
        <button
          onClick={handleAdd}
          disabled={saving || !form.description || !form.amount}
          className={`w-full py-2 rounded-lg font-semibold text-sm transition ${
            saving || !form.description || !form.amount
              ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
              : 'bg-green-500 text-black hover:bg-green-400'
          }`}
        >
          {saving ? 'Saving...' : '+ Add Expense'}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['All', ...CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition ${
              activeFilter === cat
                ? 'bg-green-500 text-black font-semibold'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Expense List */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center text-zinc-400 py-8">
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-zinc-400">
            <p className="text-4xl mb-3">💸</p>
            <p className="font-semibold">No expenses yet!</p>
            <p className="text-sm">Add your first expense above</p>
          </div>
        ) : (
          filtered.map(expense => (
            <div
              key={expense.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex items-center justify-between"
            >
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {expense.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    categoryColors[expense.category] ||
                    categoryColors.Other
                  }`}>
                    {expense.category}
                  </span>
                  <span className="text-zinc-500 text-xs">
                    {new Date(expense.date)
                      .toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-red-400 font-mono font-semibold">
                  ₹{Number(expense.amount)
                    .toLocaleString('en-IN')}
                </span>
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="text-zinc-600 hover:text-red-400 transition"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
