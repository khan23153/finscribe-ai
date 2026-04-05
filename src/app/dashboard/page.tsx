"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { IndianRupee, Inbox } from "lucide-react";

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [monthlySpend, setMonthlySpend] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [categoryData, setCategoryData] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // Set bypass cookie
    document.cookie = 'onboarding-bypass=true; max-age=2592000; path=/';
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/expenses');
      const data = await res.json();
      const expensesData = data.expenses || [];
      setExpenses(expensesData);

      // Calculate totals
      const total = expensesData.reduce(
        (sum: number, e: any) => sum + Number(e.amount), 0
      );
      setMonthlySpend(total);
      setTransactionCount(expensesData.length);

      // Category breakdown
      const cats: Record<string, number> = {};
      expensesData.forEach((e: any) => {
        cats[e.category] = (cats[e.category] || 0) + Number(e.amount);
      });
      setCategoryData(cats);

    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  const hasData = expenses.length > 0;

  // For the chart and design
  const areaD = "M0,120 L0,90 Q50,75 100,60 T200,75 T300,40 T400,55 T500,25 L500,120 Z";
  const pathD = "M0,90 Q50,75 100,60 T200,75 T300,40 T400,55 T500,25";

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">
            Hi, {user.firstName || "there"}! 👋
          </h1>
          <p className="text-muted mt-1">Here's what's happening with your money today.</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/dashboard/expenses"
            className="bg-accent hover:bg-accent-dark text-background px-5 py-2.5 rounded-full font-bold text-sm transition-colors flex items-center gap-2"
          >
            <span>+</span> Add Transaction
          </a>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-border p-6 rounded-xl relative overflow-hidden group hover:border-accent/50 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <h3 className="text-sm font-medium text-muted mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent"></span> Monthly Spend
            </h3>
            <p className="text-3xl font-mono font-bold mt-2">
              <span className="text-accent">₹</span>
              {monthlySpend.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="bg-surface border border-border p-6 rounded-xl relative overflow-hidden group hover:border-accent/50 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <h3 className="text-sm font-medium text-muted mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-dark"></span> Transactions
            </h3>
            <p className="text-3xl font-mono font-bold mt-2 text-foreground">
              {transactionCount}
            </p>
          </div>
        </div>

        <div className="bg-surface border border-border p-6 rounded-xl relative overflow-hidden group hover:border-accent/50 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <h3 className="text-sm font-medium text-muted mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Active Categories
            </h3>
            <p className="text-3xl font-mono font-bold mt-2">
              {Object.keys(categoryData).length}
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout for Charts/Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Spending Trend (Area Chart Mock) */}
        <div className="lg:col-span-3 bg-surface border border-border p-6 rounded-xl flex flex-col min-h-[300px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display font-bold text-lg">Spending Trend</h3>
            <select className="bg-background border border-border rounded-md px-2 py-1 text-xs text-muted outline-none focus:border-accent">
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="flex-1 relative flex items-end">
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

        {/* Category Breakdown */}
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
                    <span className="font-mono font-bold text-xl">{Object.keys(categoryData).length}</span>
                    <span className="text-xs text-muted">Categories</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                {Object.entries(categoryData).slice(0, 4).map(([cat, amount], i) => {
                  const colors = ['bg-accent', 'bg-accent-dark', 'bg-[#4ade80]', 'bg-[#86efac]'];
                  const colorClass = colors[i % colors.length];
                  const percentage = Math.round((amount / monthlySpend) * 100);

                  return (
                    <div key={cat} className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${colorClass.startsWith('bg-[') ? '' : colorClass}`} style={colorClass.startsWith('bg-[') ? {backgroundColor: colorClass.slice(4, -1)} : {}}></span>
                      <span className="text-sm">{cat} ({percentage}%)</span>
                    </div>
                  );
                })}
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
            <p className="text-lg font-medium mb-6">No transactions yet. Add your first expense!</p>
            <a
              href="/dashboard/expenses"
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-bold text-sm transition-colors"
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
                    <td className="px-6 py-4 text-sm text-muted whitespace-nowrap">{new Date(tx.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</td>
                    <td className="px-6 py-4 text-sm font-medium">{tx.description}</td>
                    <td className="px-6 py-4 text-sm text-muted">
                      <span className="bg-background px-2 py-1 rounded border border-border">{tx.category}</span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-right text-accent">
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
