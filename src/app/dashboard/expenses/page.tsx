'use client'

import { useState, useMemo } from 'react'

type Category = 'Food' | 'Transport' | 'Shopping' | 'Bills' | 'Entertainment' | 'Health' | 'Other'

type Expense = {
  id: number
  desc: string
  cat: Category
  amount: number
  date: string
}

const initialExpenses: Expense[] = [
  { id: 1, desc: "Lunch at Cafe", cat: "Food", amount: 450, date: "2026-03-28" },
  { id: 2, desc: "Ola Cab", cat: "Transport", amount: 180, date: "2026-03-27" },
  { id: 3, desc: "Amazon Order", cat: "Shopping", amount: 1299, date: "2026-03-26" },
  { id: 4, desc: "Electricity Bill", cat: "Bills", amount: 2100, date: "2026-03-25" },
  { id: 5, desc: "Movie Tickets", cat: "Entertainment", amount: 600, date: "2026-03-24" },
]

const categories: Category[] = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other']
const filterTabs = ['All', 'Food', 'Transport', 'Shopping', 'Bills'] as const

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [cat, setCat] = useState<Category>('Food')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [activeFilter, setActiveFilter] = useState<string>('All')

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault()
    if (!desc || !amount) return
    const newExpense: Expense = {
      id: Date.now(),
      desc,
      cat,
      amount: parseFloat(amount),
      date
    }
    setExpenses([newExpense, ...expenses])
    setDesc('')
    setAmount('')
    setCat('Food')
    setDate(new Date().toISOString().split('T')[0])
  }

  const handleDelete = (id: number) => {
    setExpenses(expenses.filter(e => e.id !== id))
  }

  const filteredExpenses = expenses.filter(e => activeFilter === 'All' || e.cat === activeFilter)

  const summary = useMemo(() => {
    let total = 0
    const catTotals: Record<string, number> = {}
    expenses.forEach(e => {
      total += e.amount
      catTotals[e.cat] = (catTotals[e.cat] || 0) + e.amount
    })

    let biggestCat = 'None'
    let maxAmount = 0
    for (const [c, amt] of Object.entries(catTotals)) {
      if (amt > maxAmount) {
        maxAmount = amt
        biggestCat = c
      }
    }

    return { total, biggestCat, count: expenses.length }
  }, [expenses])

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8">
      {/* SECTION C - Summary Bar */}
      <div className="grid grid-cols-3 gap-4 font-mono bg-zinc-900 p-4 rounded-xl border border-zinc-800 text-zinc-100">
        <div className="flex flex-col">
          <span className="text-sm text-zinc-400">Total this month</span>
          <span className="text-xl sm:text-2xl font-bold text-red-400">₹{summary.total.toFixed(2)}</span>
        </div>
        <div className="flex flex-col border-l border-zinc-800 pl-4">
          <span className="text-sm text-zinc-400">Biggest category</span>
          <span className="text-xl sm:text-2xl font-bold text-yellow-400">{summary.biggestCat}</span>
        </div>
        <div className="flex flex-col border-l border-zinc-800 pl-4">
          <span className="text-sm text-zinc-400">Count</span>
          <span className="text-xl sm:text-2xl font-bold text-blue-400">{summary.count}</span>
        </div>
      </div>

      {/* SECTION A - Add Expense Form */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl text-zinc-100">
        <h2 className="text-xl font-bold mb-4">Add New Expense</h2>
        <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
          <div className="flex flex-col">
            <label className="text-xs text-zinc-400 mb-1">Description</label>
            <input
              type="text"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              placeholder="What did you buy?"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-zinc-400 mb-1">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-zinc-400 mb-1">Category</label>
            <select
              value={cat}
              onChange={e => setCat(e.target.value as Category)}
              className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-zinc-400 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Add Expense
          </button>
        </form>
      </div>

      {/* SECTION B - Expense List */}
      <div>
        <div className="flex space-x-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {filterTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                activeFilter === tab
                  ? 'bg-zinc-100 text-zinc-900 font-medium'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
            <p className="text-zinc-400 text-lg">No expenses yet! 🎉</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExpenses.map(expense => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                  <div>
                    <h3 className="text-zinc-100 font-medium">{expense.desc}</h3>
                    <p className="text-zinc-500 text-xs mt-1">{expense.date}</p>
                  </div>
                  <span className="inline-block px-2.5 py-1 bg-zinc-800 text-zinc-300 text-xs rounded-md w-max mt-2 sm:mt-0">
                    {expense.cat}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-mono text-red-400 font-bold">₹{expense.amount.toFixed(2)}</span>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="text-zinc-500 hover:text-red-400 transition-colors p-2"
                    aria-label="Delete expense"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
