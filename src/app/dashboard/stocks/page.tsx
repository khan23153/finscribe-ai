'use client'

import { useState } from 'react'

type Stock = {
  symbol: string
  name: string
  price: number
  change: number
}

const initialWatchlist: Stock[] = [
  { symbol: "RELIANCE", name: "Reliance Industries", price: 2847.50, change: +1.2 },
  { symbol: "TCS", name: "Tata Consultancy Services", price: 3921.00, change: -0.4 },
  { symbol: "INFY", name: "Infosys Ltd", price: 1654.30, change: +0.8 },
  { symbol: "HDFCBANK", name: "HDFC Bank", price: 1423.75, change: +0.2 },
  { symbol: "WIPRO", name: "Wipro Ltd", price: 487.60, change: -1.1 },
]

export default function StocksPage() {
  const [watchlist, setWatchlist] = useState<Stock[]>(initialWatchlist)

  const [stockToAnalyze, setStockToAnalyze] = useState('')
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const analyzeStock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stockToAnalyze) return

    setIsLoading(true)
    setAiAnalysis(null)

    try {
      const systemPrompt = "You are a SEBI-registered financial advisor AI for Indian stock markets. English only. Always include risk disclaimer."
      const userMessage = `Analyze ${stockToAnalyze} for Indian retail investor. Short-term and long-term outlook. 3 key points.`

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
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
      {/* SECTION A — Market Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { name: "NIFTY 50", value: 22147.90, change: +0.34 },
          { name: "SENSEX", value: 73018.25, change: +0.41 },
          { name: "BANK NIFTY", value: 46874.15, change: -0.12 },
          { name: "INDIA VIX", value: 14.23, change: -2.1 },
        ].map(idx => (
          <div key={idx.name} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col items-center justify-center text-center">
            <h4 className="text-xs text-zinc-400 mb-1 tracking-wider">{idx.name}</h4>
            <div className="text-lg font-mono text-zinc-100 font-bold">{idx.value.toLocaleString('en-IN')}</div>
            <div className={`text-xs font-mono font-medium mt-1 ${idx.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {idx.change > 0 ? '▲' : '▼'} {Math.abs(idx.change)}%
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Watchlist & Portfolio */}
        <div className="lg:col-span-2 space-y-8">

          {/* SECTION B — Watchlist */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-5 flex justify-between items-center bg-zinc-950 border-b border-zinc-800">
              <h3 className="font-bold text-zinc-100">Market Watchlist</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-950/50 text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 font-medium">Symbol</th>
                    <th className="px-6 py-4 font-medium">Company</th>
                    <th className="px-6 py-4 font-medium text-right">Price</th>
                    <th className="px-6 py-4 font-medium text-right">Change%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {watchlist.map(stock => (
                    <tr key={stock.symbol} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-zinc-100">{stock.symbol}</td>
                      <td className="px-6 py-4">{stock.name}</td>
                      <td className="px-6 py-4 text-right font-mono text-zinc-300 font-medium">₹{stock.price.toFixed(2)}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-right font-mono font-bold ${
                        stock.change >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {stock.change > 0 ? '+' : ''}{stock.change}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION D — Portfolio Tracker */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-5 flex justify-between items-center bg-zinc-950 border-b border-zinc-800">
              <h3 className="font-bold text-zinc-100">Your Portfolio</h3>
              <span className="text-xs font-mono bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 px-2 py-1 rounded">
                Total P&L: ₹0.00
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm text-zinc-300">
                <thead className="bg-zinc-950/50 text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 font-medium text-left">Stock</th>
                    <th className="px-6 py-4 font-medium">Qty</th>
                    <th className="px-6 py-4 font-medium">Buy Price</th>
                    <th className="px-6 py-4 font-medium">LTP</th>
                    <th className="px-6 py-4 font-medium">P&L</th>
                    <th className="px-6 py-4 font-medium">P&L%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {[].map((pos: { sym: string, qty: number, buy: number, ltp: number }) => {
                    const pl = (pos.ltp - pos.buy) * pos.qty
                    const plpct = ((pos.ltp - pos.buy) / pos.buy) * 100
                    return (
                      <tr key={pos.sym} className="hover:bg-zinc-800/50 transition-colors font-mono">
                        <td className="px-6 py-4 whitespace-nowrap text-left font-bold text-zinc-100">{pos.sym}</td>
                        <td className="px-6 py-4">{pos.qty}</td>
                        <td className="px-6 py-4">₹{pos.buy.toFixed(2)}</td>
                        <td className="px-6 py-4">₹{pos.ltp.toFixed(2)}</td>
                        <td className={`px-6 py-4 font-bold ${pl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {pl >= 0 ? '+' : ''}₹{pl.toFixed(2)}
                        </td>
                        <td className={`px-6 py-4 font-bold ${plpct >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {plpct >= 0 ? '+' : ''}{plpct.toFixed(2)}%
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: AI Analysis */}
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl text-zinc-100">
            <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2 mb-4 border-b border-zinc-800 pb-4">
              <span>🧠</span> AI Stock Analysis
            </h3>

            <form onSubmit={analyzeStock} className="space-y-4">
              <div className="flex flex-col">
                <label className="text-xs text-zinc-400 mb-2">Enter Stock Symbol or Company Name</label>
                <input
                  type="text"
                  value={stockToAnalyze}
                  onChange={e => setStockToAnalyze(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-green-500 w-full"
                  placeholder="e.g. RELIANCE, Tata Motors"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Analyzing...
                  </>
                ) : (
                  <>Analyze with AI</>
                )}
              </button>
            </form>

            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 flex items-start gap-2">
              <span className="text-sm">⚠️</span>
              <p>Not financial advice. Stock markets are subject to market risks. Read all related documents carefully before investing.</p>
            </div>
          </div>

          {aiAnalysis && (
            <div className="bg-zinc-900 border border-green-500/30 p-6 rounded-xl text-zinc-100 animate-in slide-in-from-top-4">
              <h4 className="text-sm font-bold text-green-400 mb-3 uppercase tracking-wide">Analysis Result</h4>
              <div className="whitespace-pre-wrap text-sm text-zinc-300 leading-relaxed border-t border-zinc-800 pt-3">
                {aiAnalysis}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
