export default function DashboardPage() {
  const stats = [
    { label: "Total Balance", value: "₹2,45,000", trend: "up", change: "+12%" },
    { label: "Monthly Spend", value: "₹42,500", trend: "neutral", change: "0%" },
    { label: "Savings Rate", value: "24%", trend: "up", change: "+4%" },
    { label: "Transactions", value: "128", trend: "down", change: "-5%" }
  ];

  const transactions = [
    { id: 1, date: "Oct 24", desc: "Zomato", category: "Food & Dining", amount: -450, status: "Completed" },
    { id: 2, date: "Oct 22", desc: "Salary Credit", category: "Income", amount: 125000, status: "Completed" },
    { id: 3, date: "Oct 20", desc: "Netflix Subscription", category: "Entertainment", amount: -649, status: "Completed" },
    { id: 4, date: "Oct 19", desc: "Amazon Groceries", category: "Shopping", amount: -3200, status: "Pending" },
    { id: 5, date: "Oct 18", desc: "Uber Trip", category: "Travel", amount: -850, status: "Completed" },
  ];

  // Mock AreaChart data using SVG path (since recharts isn't installed)
  // Data: [Jan:12000, Feb:18000, Mar:15000, Apr:22000, May:19000, Jun:25000]
  // Mapped to 0-100 height, width 0-500
  const pathD = "M0,90 L100,60 L200,75 L300,40 L400,55 L500,25";
  const areaD = `${pathD} L500,120 L0,120 Z`;

  return (
    <div className="space-y-8">
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
          </div>
        </div>

        {/* Category Breakdown (Donut Mock) */}
        <div className="lg:col-span-2 bg-surface border border-border p-6 rounded-xl flex flex-col">
          <h3 className="font-display font-bold text-lg mb-6">Category Breakdown</h3>
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
        </div>
      </div>

      {/* AI Insight Card */}
      <div className="bg-accent/5 border border-accent/30 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6 justify-between">
        <div className="flex items-start gap-4">
          <div className="text-3xl animate-bounce mt-1">🧠</div>
          <div>
            <h4 className="font-display font-bold text-lg text-accent mb-1">AI Financial Insight</h4>
            <p className="text-sm text-foreground/80 leading-relaxed max-w-2xl">
              Based on your spending patterns, you spend 34% more on weekends. Consider setting a weekend budget of ₹3,000 to save ₹8,400/month.
            </p>
          </div>
        </div>
        <a
          href="/onboarding/quiz"
          className="bg-accent hover:bg-accent-dark text-background px-6 py-2 rounded-full font-bold text-sm transition-colors whitespace-nowrap"
        >
          Get Personalized Tips &rarr;
        </a>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="font-display font-bold text-lg">Recent Transactions</h3>
          <a href="/dashboard/expenses" className="text-sm text-accent hover:underline">View All &rarr;</a>
        </div>
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
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-border hover:bg-background/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-muted whitespace-nowrap">{tx.date}</td>
                  <td className="px-6 py-4 text-sm font-medium">{tx.desc}</td>
                  <td className="px-6 py-4 text-sm text-muted">
                    <span className="bg-background px-2 py-1 rounded border border-border">{tx.category}</span>
                  </td>
                  <td className={`px-6 py-4 font-mono font-bold text-right ${tx.amount > 0 ? 'text-accent' : 'text-red-400'}`}>
                    {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 flex justify-center">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
                      tx.status === 'Completed'
                        ? 'bg-accent/10 border-accent/20 text-accent'
                        : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
