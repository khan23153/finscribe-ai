import re

with open('src/app/dashboard/expenses/page.tsx', 'r') as f:
    content = f.read()

# Let's write the whole file anew since it's changing completely to a client component.
new_content = """'use client';
import { useState } from "react";
import { Inbox, PlusCircle, Trash2 } from "lucide-react";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);

  let totalAmount = 0;
  const categoryTotals: Record<string, number> = {};

  expenses.forEach(e => {
    const amt = Number(e.amount);
    totalAmount += amt;
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + amt;
  });

  let biggestCategory = 'None';
  let maxAmount = 0;
  for (const [cat, amt] of Object.entries(categoryTotals)) {
    if (amt > maxAmount) {
      maxAmount = amt;
      biggestCategory = cat;
    }
  }

  const hasData = expenses.length > 0;

  function addExpense(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const desc = formData.get('desc') as string;
    const amount = formData.get('amount') as string;
    const cat = formData.get('cat') as string;
    const dateStr = formData.get('date') as string;

    if (!desc || !amount || !cat || !dateStr) return;

    const newExpense = {
      id: Math.random().toString(36).substring(7),
      title: desc,
      amount: parseFloat(amount),
      category: cat,
      date: new Date(dateStr)
    };

    setExpenses([newExpense, ...expenses]);
    e.currentTarget.reset();
  }

  function deleteExpense(id: string) {
    setExpenses(expenses.filter(e => e.id !== id));
  }

  const categories = ['Food & Dining', 'Transport', 'Shopping', 'Bills & Utilities', 'Entertainment', 'Health & Fitness', 'Other'];
  const filterTabs = ['All', 'Food & Dining', 'Transport', 'Shopping', 'Bills & Utilities'];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8">
      {/* Summary Bar */}
      <div className="grid grid-cols-3 gap-4 font-mono bg-surface p-4 rounded-xl border border-border text-foreground">
        <div className="flex flex-col">
          <span className="text-sm text-muted">Total this month</span>
          <span className="text-xl sm:text-2xl font-bold text-red-400">₹{totalAmount.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex flex-col border-l border-border pl-4">
          <span className="text-sm text-muted">Biggest category</span>
          <span className="text-xl sm:text-2xl font-bold text-accent">{biggestCategory}</span>
        </div>
        <div className="flex flex-col border-l border-border pl-4">
          <span className="text-sm text-muted">Count</span>
          <span className="text-xl sm:text-2xl font-bold text-blue-400">{expenses.length}</span>
        </div>
      </div>

      {/* Add Expense Form */}
      <div className="bg-surface border border-border p-6 rounded-xl text-foreground">
        <h2 className="text-xl font-bold mb-4 font-display">Add New Expense</h2>
        <form onSubmit={addExpense} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
          <div className="flex flex-col">
            <label className="text-xs text-muted mb-1" htmlFor="desc">Description</label>
            <input
              type="text"
              name="desc"
              id="desc"
              required
              className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
              placeholder="What did you buy?"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-muted mb-1" htmlFor="amount">Amount (₹)</label>
            <input
              type="number"
              name="amount"
              id="amount"
              required
              className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-muted mb-1" htmlFor="cat">Category</label>
            <select
              name="cat"
              id="cat"
              required
              className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-muted mb-1" htmlFor="date">Date</label>
            <input
              type="date"
              name="date"
              id="date"
              required
              defaultValue={new Date().toISOString().split('T')[0]}
              className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <button
            type="submit"
            className="bg-accent hover:bg-accent-dark text-background font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Add
          </button>
        </form>
      </div>

      {/* Expense List */}
      <div>
        <div className="flex space-x-2 mb-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {filterTabs.map(tab => (
            <button
              key={tab}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                tab === 'All'
                  ? 'bg-accent/20 text-accent font-medium border border-accent/50'
                  : 'bg-surface text-muted border border-border hover:bg-background'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {!hasData ? (
          <div className="text-center py-16 bg-surface/50 rounded-xl border border-border/50 flex flex-col items-center justify-center">
            <div className="text-6xl mb-4">💸</div>
            <p className="text-foreground font-medium text-lg">No expenses yet! Add your first one above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map(expense => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl hover:border-accent/30 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                  <div>
                    <h3 className="text-foreground font-medium">{expense.title}</h3>
                    <p className="text-muted text-xs mt-1">
                      {expense.date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <span className="inline-block px-2.5 py-1 bg-background border border-border text-muted text-xs rounded-md w-max mt-2 sm:mt-0">
                    {expense.category}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-mono text-foreground font-bold">₹{Number(expense.amount).toLocaleString('en-IN')}</span>
                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="text-muted hover:text-red-400 transition-colors p-2"
                    aria-label="Delete expense"
                  >
                    <Trash2 className="w-4 h-4" />
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
"""

with open('src/app/dashboard/expenses/page.tsx', 'w') as f:
    f.write(new_content)
