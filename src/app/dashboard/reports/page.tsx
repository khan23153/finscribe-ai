'use client'

import { useState } from 'react'
import { Sparkles, Calendar } from 'lucide-react'

export default function ReportsPage() {
  const [activePeriod, setActivePeriod] = useState("This Month")
  const [aiReport, setAiReport] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const periods = ["This Week", "This Month", "Last 3 Months", "This Year"]

  // Mock data for zero state
  const totalIncome = 0
  const totalSpent = 0
  const netSavings = 0
  const savingsRate = 0
  const categories: any[] = []

  const generateReport = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: 'You are a financial analyst. English only. Be concise.',
          messages: [
            {
              role: "user",
              content: 'Generate a brief monthly financial health report with 3 insights and 2 recommendations for someone just starting to track their finances.'
            }
          ]
        })
      })
      const data = await response.json()
      setAiReport(data.reply)
    } catch (error) {
      setAiReport("Failed to generate AI report. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Financial Reports</h1>
          <p className="text-muted">Analyze your spending patterns and financial health.</p>
        </div>
      </div>

      {/* SECTION A - Period Selector */}
      <div className="flex overflow-x-auto space-x-2 pb-2" style={{ scrollbarWidth: "none" }}>
        {periods.map(p => (
          <button
            key={p}
            onClick={() => setActivePeriod(p)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
              activePeriod === p
                ? "bg-accent text-black font-medium"
                : "bg-surface text-muted border border-border hover:bg-background"
            }`}
          >
            <Calendar size={14} />
            {p}
          </button>
        ))}
      </div>

      {/* SECTION B - Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-zinc-800 p-5 rounded-xl border-l-4 border-l-blue-500">
          <p className="text-sm text-muted mb-1">Total Income</p>
          <p className="font-mono text-2xl font-bold">₹{totalIncome}</p>
        </div>
        <div className="bg-surface border border-zinc-800 p-5 rounded-xl border-l-4 border-l-red-500">
          <p className="text-sm text-muted mb-1">Total Spent</p>
          <p className="font-mono text-2xl font-bold">₹{totalSpent}</p>
        </div>
        <div className="bg-surface border border-zinc-800 p-5 rounded-xl border-l-4 border-l-green-500">
          <p className="text-sm text-muted mb-1">Net Savings</p>
          <p className="font-mono text-2xl font-bold">₹{netSavings}</p>
        </div>
        <div className="bg-surface border border-zinc-800 p-5 rounded-xl border-l-4 border-l-purple-500">
          <p className="text-sm text-muted mb-1">Savings Rate</p>
          <p className="font-mono text-2xl font-bold">{savingsRate}%</p>
        </div>
      </div>

      {/* SECTION C - Spending by Category */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h3 className="font-display font-bold text-lg mb-6">Spending by Category</h3>
        {categories.length === 0 ? (
          <div className="text-center py-12 text-muted">
            <p>No spending data for this period</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background/50 border-b border-border text-xs uppercase text-muted">
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium text-right">% of Total</th>
                  <th className="px-4 py-3 font-medium text-right">Transactions</th>
                </tr>
              </thead>
              <tbody>
                {/* Data rows would go here */}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION D - AI Monthly Report */}
      <div className="bg-surface border border-accent/30 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-accent" />
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="font-display font-bold text-lg flex items-center gap-2">
              <span className="text-2xl">🧠</span> AI Monthly Report
            </h3>
            <p className="text-sm text-muted mt-1">Get personalized insights based on your spending.</p>
          </div>
          <button
            onClick={generateReport}
            disabled={isGenerating}
            className="bg-accent hover:bg-accent-dark text-black font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles size={16} />
            {isGenerating ? "Generating..." : "Generate AI Report"}
          </button>
        </div>

        {aiReport && (
          <div className="bg-background border border-border rounded-lg p-5 mt-4">
            <div className="prose prose-sm prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm text-zinc-300">
                {aiReport}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
