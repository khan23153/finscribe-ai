'use client'

import { useState, useMemo } from 'react'

export default function EMICalculatorPage() {
  const [amount, setAmount] = useState(1000000)
  const [rate, setRate] = useState(8.5)
  const [tenure, setTenure] = useState(120) // in months

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showAllRows, setShowAllRows] = useState(false)

  // Formula: EMI = P * r * (1+r)^n / ((1+r)^n - 1)
  const calculation = useMemo(() => {
    const P = amount
    const r = rate / 12 / 100 // monthly interest rate
    const n = tenure

    let emi = 0
    let totalPayable = 0
    let totalInterest = 0

    if (r === 0) {
      emi = P / n
      totalPayable = P
    } else {
      emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      totalPayable = emi * n
      totalInterest = totalPayable - P
    }

    // Amortization Table
    const table = []
    let balance = P
    for (let month = 1; month <= n; month++) {
      const interestForMonth = balance * r
      const principalForMonth = emi - interestForMonth
      balance -= principalForMonth

      // handle floating point precision
      if (balance < 0) balance = 0

      table.push({
        month,
        principal: principalForMonth,
        interest: interestForMonth,
        balance
      })
    }

    return {
      emi,
      totalPayable,
      totalInterest,
      interestPercent: (totalInterest / totalPayable) * 100,
      table
    }
  }, [amount, rate, tenure])

  const { emi, totalPayable, totalInterest, interestPercent, table } = calculation

  const getAIAnalysis = async () => {
    setIsLoading(true)
    setAiAnalysis(null)

    try {
      const systemPrompt = "You are a financial advisor. English only. Give practical loan advice. Add risk disclaimer."
      const userMessage = `Loan: ₹${amount.toLocaleString('en-IN')}, EMI: ₹${emi.toFixed(0).toLocaleString()}, tenure: ${tenure} months, rate: ${rate}%. Is this affordable? Give 3 tips.`

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt,
          messages: [{ role: 'user', content: userMessage }]
        })
      })

      const data = await response.json()
      setAiAnalysis(data.reply)
    } catch (error) {
      setAiAnalysis("Failed to get AI analysis. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SECTION A — Calculator */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl text-zinc-100 space-y-8">
          <h2 className="text-xl font-bold border-b border-zinc-800 pb-4">EMI Calculator</h2>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm text-zinc-400">Loan Amount</label>
                <div className="bg-zinc-800 px-3 py-1 rounded border border-zinc-700 font-mono text-green-400 font-bold">
                  ₹{amount.toLocaleString('en-IN')}
                </div>
              </div>
              <input
                type="range"
                min="100000" max="10000000" step="50000"
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full accent-green-500"
              />
              <div className="flex justify-between text-xs text-zinc-500">
                <span>₹1L</span>
                <span>₹1Cr</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm text-zinc-400">Interest Rate (% p.a.)</label>
                <div className="bg-zinc-800 px-3 py-1 rounded border border-zinc-700 font-mono text-blue-400 font-bold">
                  {rate.toFixed(1)}%
                </div>
              </div>
              <input
                type="range"
                min="1" max="36" step="0.1"
                value={rate}
                onChange={e => setRate(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-zinc-500">
                <span>1%</span>
                <span>36%</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm text-zinc-400">Loan Tenure</label>
                <div className="bg-zinc-800 px-3 py-1 rounded border border-zinc-700 font-mono text-yellow-400 font-bold">
                  {tenure} mos ({(tenure / 12).toFixed(1)} yrs)
                </div>
              </div>
              <input
                type="range"
                min="6" max="360" step="6"
                value={tenure}
                onChange={e => setTenure(Number(e.target.value))}
                className="w-full accent-yellow-500"
              />
              <div className="flex justify-between text-xs text-zinc-500">
                <span>6 mos</span>
                <span>360 mos</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION B — Results */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl text-zinc-100 flex flex-col justify-center">
          <div className="text-center mb-8">
            <p className="text-zinc-400 mb-2">Your Monthly EMI</p>
            <h3 className="text-4xl text-green-500 font-mono font-bold">
              ₹{emi.toFixed(0).toLocaleString()}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-zinc-800 pt-6">
            <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800">
              <p className="text-xs text-zinc-500 mb-1">Total Principal</p>
              <p className="text-lg font-mono text-zinc-200">₹{amount.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800">
              <p className="text-xs text-zinc-500 mb-1">Total Interest ({interestPercent.toFixed(1)}%)</p>
              <p className="text-lg font-mono text-red-400">₹{totalInterest.toFixed(0).toLocaleString()}</p>
            </div>
            <div className="col-span-2 bg-zinc-950 p-4 rounded-lg border border-zinc-800 flex justify-between items-center">
              <p className="text-sm text-zinc-400">Total Payable</p>
              <p className="text-xl font-mono font-bold text-zinc-100">₹{totalPayable.toFixed(0).toLocaleString()}</p>
            </div>
          </div>

          {/* SECTION C — AI Analysis Button */}
          <div className="mt-6">
            <button
              onClick={getAIAnalysis}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Analyzing...
                </>
              ) : (
                <>🧠 Get AI Analysis</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AI Analysis Result */}
      {aiAnalysis && (
        <div className="bg-zinc-900 border border-green-500/30 p-6 rounded-xl text-zinc-100 animate-in slide-in-from-bottom-4">
          <h3 className="text-lg font-bold text-green-400 flex items-center gap-2 mb-4 border-b border-zinc-800 pb-3">
            <span>🧠</span> AI Loan Advisor Analysis
          </h3>
          <div className="whitespace-pre-wrap text-sm text-zinc-300 leading-relaxed">
            {aiAnalysis}
          </div>
        </div>
      )}

      {/* SECTION D — Amortization Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-5 flex justify-between items-center bg-zinc-950 border-b border-zinc-800">
          <h3 className="font-bold text-zinc-100">Amortization Schedule</h3>
          <button
            onClick={() => setShowAllRows(!showAllRows)}
            className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded transition-colors"
          >
            {showAllRows ? 'Show Less' : 'Show All'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm text-zinc-300">
            <thead className="bg-zinc-950/50 text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium text-left">Month</th>
                <th className="px-6 py-4 font-medium">Principal</th>
                <th className="px-6 py-4 font-medium">Interest</th>
                <th className="px-6 py-4 font-medium">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {(showAllRows ? table : table.slice(0, 12)).map(row => (
                <tr key={row.month} className="hover:bg-zinc-800/50 transition-colors font-mono">
                  <td className="px-6 py-3 whitespace-nowrap text-left text-zinc-400">{row.month}</td>
                  <td className="px-6 py-3">₹{row.principal.toFixed(0).toLocaleString()}</td>
                  <td className="px-6 py-3 text-red-400">₹{row.interest.toFixed(0).toLocaleString()}</td>
                  <td className="px-6 py-3 font-medium">₹{row.balance.toFixed(0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!showAllRows && table.length > 12 && (
            <div className="text-center py-4 bg-zinc-950/50 text-zinc-500 text-sm border-t border-zinc-800">
              + {table.length - 12} more rows
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
