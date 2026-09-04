'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Newspaper } from 'lucide-react'
import { z } from 'zod'

const newsItemSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  category: z.enum(['Markets', 'Economy', 'Crypto', 'Banking', 'RBI']),
  sentiment: z.enum(['positive', 'negative', 'neutral']),
  publishedAt: z.string().min(1),
})

const newsSchema = z.array(newsItemSchema).min(1).max(8)
type NewsItem = z.infer<typeof newsItemSchema>
type NewsCategory = 'All' | NewsItem['category']

export default function FinanceNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<NewsCategory>('All')
  const [error, setError] = useState<string | null>(null)
  const [sources, setSources] = useState<Array<{ title: string; url: string }>>([])

  const tabs: NewsCategory[] = ['All', 'Markets', 'Economy', 'Crypto', 'Banking', 'RBI']

  const fetchNews = async () => {
    setIsLoading(true)
    setNews([])
    setSources([])
    setError(null)

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: 'news',
          messages: [
            {
              role: "user",
              content: 'Find eight recent, verifiable Indian financial news items. Use ISO 8601 dates in publishedAt and the required categories and sentiment values.'
            }
          ]
        })
      })

      const data = await response.json() as {
        reply?: string
        error?: string
        sources?: Array<{ title: string; url: string }>
      }
      if (!response.ok || !data.reply) {
        throw new Error(data.error ?? 'Unable to load finance news.')
      }

      const parsed = newsSchema.safeParse(JSON.parse(data.reply))
      if (!parsed.success) throw new Error('The news service returned an invalid response.')

      setNews(parsed.data)
      setSources(data.sources ?? [])
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to load finance news.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [])

  const filteredNews = activeTab === 'All' ? news : news.filter(item => item.category === activeTab)

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-3">
            <Newspaper className="w-8 h-8 text-accent" />
            Finance News
          </h1>
          <p className="text-muted mt-2">Recent Indian market updates grounded with web search</p>
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

      {error && (
        <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

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
          : filteredNews.map((item) => {
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
                  key={`${item.title}-${item.publishedAt}`}
                  className="bg-surface border border-zinc-800 rounded-xl p-4 hover:border-zinc-600 transition flex flex-col"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md ${categoryColors[item.category] || "bg-zinc-800 text-zinc-400"}`}>
                        {item.category}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${sentimentColors[item.sentiment] || "bg-zinc-400"}`} />
                    </div>
                    <time className="text-xs text-zinc-400" dateTime={item.publishedAt}>
                      {formatPublishedDate(item.publishedAt)}
                    </time>
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

      {sources.length > 0 && (
        <section className="bg-surface border border-border rounded-xl p-5">
          <h2 className="font-semibold mb-3">Sources used for this briefing</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-accent hover:underline break-all"
                >
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function formatPublishedDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
