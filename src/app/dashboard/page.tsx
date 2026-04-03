import { auth } from "@clerk/nextjs/server";
import { IndianRupee, Inbox } from "lucide-react";
import { ClearCookie } from "./ClearCookie";

import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // Fetch the user's main ledger account to calculate balance
  const mainAccount = await prisma.ledgerEntity.findFirst({
    where: {
      user: { clerkId: userId },
      type: "ASSET",
      name: "Main Account"
    }
  });

  // Calculate true balance (opening balance + credits - debits)
  let totalBalance = 0;

  if (mainAccount) {
    const credits = await prisma.ledgerTransaction.aggregate({
      where: { creditEntityId: mainAccount.id },
      _sum: { amount: true }
    });

    const debits = await prisma.ledgerTransaction.aggregate({
      where: { debitEntityId: mainAccount.id },
      _sum: { amount: true }
    });

    totalBalance = Number(mainAccount.openingBalance) +
      Number(credits._sum.amount || 0) -
      Number(debits._sum.amount || 0);
  }

  // Fetch true user record
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  // Fetch expenses for current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const expenses = await prisma.expense.findMany({
    where: {
      user: { clerkId: userId },
      date: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    },
    orderBy: { date: 'desc' }
  });

  const totalMonthlySpend = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

  const stats = [
    { label: "Total Balance", value: totalBalance === 0 ? "₹0.00" : `₹${totalBalance.toLocaleString("en-IN")}`, trend: totalBalance > 0 ? "up" : "neutral", change: "Available" },
    { label: "Monthly Spend", value: totalMonthlySpend === 0 ? "₹0.00" : `₹${totalMonthlySpend.toLocaleString("en-IN")}`, trend: "neutral", change: "Current Month" },
    { label: "Savings Rate", value: totalBalance > 0 ? `${Math.round(((totalBalance - totalMonthlySpend) / Math.max(totalBalance, 1)) * 100)}%` : "0%", trend: "neutral", change: "Target" },
    { label: "Transactions", value: expenses.length === 0 ? "0" : expenses.length.toString(), trend: "neutral", change: "This Month" }
  ];

  // For AreaChart data, we'll implement zero-state
  const hasData = expenses.length > 0;
  const pathD = hasData ? "M0,90 L100,60 L200,75 L300,40 L400,55 L500,25" : "M0,100 L500,100";
  const areaD = `${pathD} L500,120 L0,120 Z`;

  return (
    <div className="space-y-8">
      <ClearCookie />
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">Overview</h1>
        <p className="text-muted">Welcome back. Here's your financial summary.</p>
      </header>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-surface border border-border p-6 rounded-xl hover:border-accent/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted">{s.label}</span>
              {s.trend === "up" && <span className="text-accent text-xs bg-accent/10 px-2 py-1 rounded font-bold">{s.change}</span>}
              {s.trend === "down" && <span className="text-red-500 text-xs bg-red-500/10 px-2 py-1 rounded font-bold">{s.change}</span>}
              {s.trend === "neutral" && <span className="text-muted text-xs bg-background px-2 py-1 rounded font-bold">{s.change}</span>}
            </div>
            <div className={`font-mono text-3xl font-bold ${s.label === 'Savings Rate' && parseInt(s.value) > 20 ? 'text-accent' : ''}`}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Spending Overview (Area Chart Mock) */}
        <div className="lg:col-span-3 bg-surface border border-border p-6 rounded-xl flex flex-col">
          <h3 className="font-display font-bold text-lg mb-6">Spending Overview</h3>
          <div className="flex-1 relative w-full h-48 sm:h-64 border-b border-border flex items-end">
            {!hasData ? (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-muted">
                 <Inbox className="w-10 h-10 mb-2 opacity-50" />
                 <p className="text-sm">Start tracking to see your spending trends</p>
               </div>
            ) : (
              <>
                {/* Y-axis labels mock */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-muted pb-6">
                  <span>30k</span>
                  <span>15k</span>
                  <span>0</span>
                </div>
                {/* SVG Chart */}
                <div className="ml-8 w-full h-full relative overflow-hidden pb-6">
                  <svg viewBox="0 0 500 120" preserveAspectRatio="none" className="w-full h-full">
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d={areaD} fill="url(#areaGradient)" />
                    <path d={pathD} fill="none" stroke="var(--color-accent)" strokeWidth="3" vectorEffect="non-scaling-stroke" />

                    {/* Data points */}
                    <circle cx="0" cy="90" r="4" fill="var(--color-background)" stroke="var(--color-accent)" strokeWidth="2" />
                    <circle cx="100" cy="60" r="4" fill="var(--color-background)" stroke="var(--color-accent)" strokeWidth="2" />
                    <circle cx="200" cy="75" r="4" fill="var(--color-background)" stroke="var(--color-accent)" strokeWidth="2" />
                    <circle cx="300" cy="40" r="4" fill="var(--color-background)" stroke="var(--color-accent)" strokeWidth="2" />
                    <circle cx="400" cy="55" r="4" fill="var(--color-background)" stroke="var(--color-accent)" strokeWidth="2" />
                    <circle cx="500" cy="25" r="4" fill="var(--color-background)" stroke="var(--color-accent)" strokeWidth="2" />
                  </svg>
                  {/* X-axis labels mock */}
                  <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-muted">
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Category Breakdown (Donut Mock) */}
        <div className="lg:col-span-2 bg-surface border border-border p-6 rounded-xl flex flex-col">
          <h3 className="font-display font-bold text-lg mb-6">Category Breakdown</h3>
          {!hasData ? (
             <div className="flex-1 flex flex-col items-center justify-center text-muted min-h-[200px]">
               <div className="w-32 h-32 rounded-full border-4 border-dashed border-border flex items-center justify-center mb-4">
                 <span className="text-sm">0%</span>
               </div>
               <p className="text-sm">No spending data yet</p>
             </div>
          ) : (
            <>
              <div className="flex-1 flex items-center justify-center relative min-h-[200px]">
                {/* CSS Conic Gradient Donut */}
                <div
                  className="w-48 h-48 rounded-full flex items-center justify-center relative"
                  style={{
                    background: `conic-gradient(
                      var(--color-accent) 0% 35%,
                      var(--color-accent-dark) 35% 55%,
                      #4ade80 55% 80%,
                      #86efac 80% 100%
                    )`
                  }}
                >
                  <div className="w-32 h-32 bg-surface rounded-full flex flex-col items-center justify-center border border-surface">
                    <span className="font-mono font-bold text-xl">4</span>
                    <span className="text-xs text-muted">Categories</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-accent"></span><span className="text-sm">Food (35%)</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-accent-dark"></span><span className="text-sm">Transport (20%)</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{backgroundColor: '#4ade80'}}></span><span className="text-sm">Shopping (25%)</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{backgroundColor: '#86efac'}}></span><span className="text-sm">Bills (20%)</span></div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* AI Insight Card */}
      <div className="bg-accent/5 border border-accent/30 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6 justify-between">
        <div className="flex items-start gap-4">
          <div className="text-3xl animate-bounce mt-1">🧠</div>
          <div>
            <h4 className="font-display font-bold text-lg text-accent mb-1">AI Financial Insight</h4>
            <p className="text-sm text-foreground/80 leading-relaxed max-w-2xl">
              {hasData
                ? "Based on your spending patterns, you spend 34% more on weekends. Consider setting a weekend budget of ₹3,000 to save ₹8,400/month."
                : "Add your first expense to get personalized AI insights about your spending patterns."}
            </p>
          </div>
        </div>
        {!hasData && (
          <a
            href="/dashboard/expenses"
            className="bg-accent hover:bg-accent-dark text-background px-6 py-2 rounded-full font-bold text-sm transition-colors whitespace-nowrap"
          >
            Add Expenses &rarr;
          </a>
        )}
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="font-display font-bold text-lg">Recent Transactions</h3>
          <a href="/dashboard/expenses" className="text-sm text-accent hover:underline">View All &rarr;</a>
        </div>

        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted">
            <Inbox className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium mb-6">No transactions yet. Add your first expense! 💸</p>
            <a
              href="/dashboard/expenses"
              className="bg-accent hover:bg-accent-dark text-background px-6 py-2 rounded-full font-bold text-sm transition-colors"
            >
              Add Expense
            </a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-background/50 border-b border-border text-xs uppercase text-muted">
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium text-right">Amount</th>
                  <th className="px-6 py-4 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {expenses.slice(0, 5).map((tx) => (
                  <tr key={tx.id} className="border-b border-border hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-muted whitespace-nowrap">{tx.date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</td>
                    <td className="px-6 py-4 text-sm font-medium">{tx.title}</td>
                    <td className="px-6 py-4 text-sm text-muted">
                      <span className="bg-background px-2 py-1 rounded border border-border">{tx.category}</span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-right text-foreground">
                      ₹{Number(tx.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 flex justify-center">
                      <span className="text-xs font-bold px-2 py-1 rounded-full border bg-accent/10 border-accent/20 text-accent">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Add Expense", icon: "➕", href: "/dashboard/expenses" },
          { label: "View Reports", icon: "📊", href: "/dashboard/reports" },
          { label: "Set Goal", icon: "🎯", href: "/dashboard/goals" },
          { label: "Retake Setup", icon: "⚙️", href: "/onboarding/quiz" }
        ].map((action, i) => (
          <a
            key={i}
            href={action.href}
            className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3 hover:border-accent transition-colors cursor-pointer"
          >
            <span className="text-xl">{action.icon}</span>
            <span className="font-medium text-sm">{action.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
