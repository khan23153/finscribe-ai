import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { Inbox, PlusCircle } from "lucide-react";

const prisma = new PrismaClient();

// This needs to be a Server Component for initial data fetch,
// then we can optionally split the client interactions into a child component
// or use server actions

export default async function ExpensesPage() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // Fetch the user to get their Prisma ID
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    return null;
  }

  // Fetch all expenses for the user
  const expenses = await prisma.expense.findMany({
    where: {
      userId: user.id
    },
    orderBy: { date: 'desc' }
  });

  // Calculate summary metrics
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

  // Create a server action inside the file (Next.js App Router feature)
  async function addExpense(formData: FormData) {
    'use server';
    const { userId } = await auth();
    if (!userId) return;

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return;

    const desc = formData.get('desc') as string;
    const amount = formData.get('amount') as string;
    const cat = formData.get('cat') as string;
    const dateStr = formData.get('date') as string;

    if (!desc || !amount || !cat || !dateStr) return;

    await prisma.expense.create({
      data: {
        userId: dbUser.id,
        title: desc,
        amount: parseFloat(amount),
        category: cat,
        date: new Date(dateStr)
      }
    });

    // We would revalidate path here, but since this is a Server Action inside a Server Component
    // we can import revalidatePath dynamically
    const { revalidatePath } = await import('next/cache');
    revalidatePath('/dashboard/expenses');
  }

  async function deleteExpense(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    if (!id) return;

    await prisma.expense.delete({
      where: { id }
    });

    const { revalidatePath } = await import('next/cache');
    revalidatePath('/dashboard/expenses');
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
        <form action={addExpense} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
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
            Add Expense
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
            <p className="text-foreground font-medium text-xl mb-2">No expenses yet!</p>
            <p className="text-muted">Add your first expense above</p>
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
                  <form action={deleteExpense}>
                    <input type="hidden" name="id" value={expense.id} />
                    <button
                      type="submit"
                      className="text-muted hover:text-red-400 transition-colors p-2"
                      aria-label="Delete expense"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
