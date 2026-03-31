'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Newspaper } from 'lucide-react'

type NewsItem = {
  title: string
  summary: string
  category: 'Markets' | 'Economy' | 'Crypto' | 'Banking' | 'RBI'
  sentiment: 'positive' | 'negative' | 'neutral'
  time: string
}

export default function FinanceNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("All")

  const tabs = ["All", "Markets", "Economy", "Crypto", "Banking", "RBI"]

  const fetchNews = async () => {
    setIsLoading(true)
    setNews([])

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: 'You are a financial news curator for Indian markets. Return ONLY a raw JSON array. No markdown, no code blocks, no explanation. Just the JSON array starting with [ and ending ]',
          messages: [
            {
              role: "user",
              content: 'Give me 8 realistic Indian financial market news headlines for today April 2026. Return as JSON array exactly: [{"title":"...","summary":"2 sentence summary of news","category":"Markets","sentiment":"positive","time":"2 hours ago"}]. Categories must be one of: Markets, Economy, Crypto, Banking, RBI. Sentiment must be one of: positive, negative, neutral'
            }
          ]
        })
      })

      const data = await response.json()
      const rawText = data.reply

      const clean = rawText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim()

      const parsed = JSON.parse(clean)

      if (Array.isArray(parsed)) {
        setNews(parsed)
      }
    } catch (error) {
      console.error("Failed to fetch news:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [])

  const filteredNews = activeTab === "All" ? news : news.filter(item => item.category === activeTab)

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-3">
            <Newspaper className="w-8 h-8 text-accent" />
            Finance News 📰
          </h1>
          <p className="text-muted mt-2">Live Indian market updates</p>
        </div>
        <button
          onClick={fetchNews}
          disabled={isLoading}
          className="bg-surface border border-border hover:bg-background text-foreground px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="flex overflow-x-auto space-x-2 pb-2" style={{ scrollbarWidth: "none" }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              activeTab === tab
                ? "bg-accent text-black font-medium"
                : "bg-surface text-zinc-400 border border-border hover:bg-background"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-zinc-800 rounded-xl h-32 w-full" />
            ))
          : filteredNews.map((item, i) => {
              const categoryColors = {
                Markets: "bg-blue-500/20 text-blue-400",
                Economy: "bg-green-500/20 text-green-400",
                Crypto: "bg-yellow-500/20 text-yellow-400",
                Banking: "bg-purple-500/20 text-purple-400",
                RBI: "bg-orange-500/20 text-orange-400"
              }
              const sentimentColors = {
                positive: "bg-green-400",
                negative: "bg-red-400",
                neutral: "bg-zinc-400"
              }

              return (
                <div
                  key={i}
                  className="bg-surface border border-zinc-800 rounded-xl p-4 hover:border-zinc-600 transition flex flex-col"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md ${categoryColors[item.category] || "bg-zinc-800 text-zinc-400"}`}>
                        {item.category}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${sentimentColors[item.sentiment] || "bg-zinc-400"}`} />
                    </div>
                    <span className="text-xs text-zinc-400">{item.time}</span>
                  </div>
                  <h3 className="font-semibold text-sm text-white mb-1 flex-1">{item.title}</h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{item.summary}</p>
                </div>
              )
            })}
      </div>

      {!isLoading && filteredNews.length === 0 && (
        <div className="text-center py-12 bg-surface border border-border rounded-xl">
          <p className="text-muted">No news found for this category.</p>
        </div>
      )}
    </div>
  )
}
