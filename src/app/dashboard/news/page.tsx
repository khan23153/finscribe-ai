'use client'

import { useCallback, useEffect, useState } from 'react'
import { ExternalLink, Newspaper, RefreshCw } from 'lucide-react'
import { z } from 'zod'
import {
  Alert,
  Button,
  Card,
  EmptyState,
  PageHeader,
  Segmented,
  Skeleton,
  cx,
} from '@/components/ui'

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
type Source = { title: string; url: string }

const tabs: NewsCategory[] = ['All', 'Markets', 'Economy', 'Banking', 'RBI', 'Crypto']

const sentimentLabel: Record<NewsItem['sentiment'], { text: string; className: string }> = {
  positive: { text: 'Positive', className: 'text-positive' },
  negative: { text: 'Negative', className: 'text-negative' },
  neutral: { text: 'Neutral', className: 'text-muted' },
}

export default function FinanceNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [sources, setSources] = useState<Source[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<NewsCategory>('All')
  const [error, setError] = useState<string | null>(null)

  const fetchNews = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'news',
          messages: [{
            role: 'user',
            content: 'Find eight recent, verifiable Indian financial news items. Use ISO 8601 dates in publishedAt and the required categories and sentiment values.',
          }],
        }),
      })
      const data = await response.json() as { reply?: string; error?: string; sources?: Source[] }
      if (!response.ok || !data.reply) throw new Error(data.error ?? 'Unable to load finance news.')

      const parsed = newsSchema.safeParse(JSON.parse(data.reply))
      if (!parsed.success) throw new Error('The news service returned an invalid response.')

      setNews(parsed.data)
      setSources(data.sources ?? [])
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to load finance news.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchNews()
  }, [fetchNews])

  const filteredNews = activeTab === 'All' ? news : news.filter((item) => item.category === activeTab)

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="News"
        description="Recent Indian finance headlines, gathered by web search with sources."
        actions={
          <Button variant="secondary" onClick={() => void fetchNews()} disabled={isLoading}>
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : undefined} />
            Refresh
          </Button>
        }
      />

      <Segmented label="Category" value={activeTab} onChange={setActiveTab} options={tabs} className="mb-4" />

      {error && <div className="mb-4"><Alert>{error}</Alert></div>}

      <Card className="overflow-hidden">
        {isLoading ? (
          <ul className="divide-y divide-border">
            {[0, 1, 2, 3].map((index) => (
              <li key={index} className="p-5 space-y-2.5">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-4 w-full" />
              </li>
            ))}
          </ul>
        ) : filteredNews.length === 0 ? (
          <EmptyState icon={Newspaper} title="No stories here" description={error ? 'Try refreshing in a moment.' : 'Nothing in this category from the latest briefing.'} />
        ) : (
          <ul className="divide-y divide-border">
            {filteredNews.map((item) => {
              const sentiment = sentimentLabel[item.sentiment]
              return (
                <li key={`${item.title}-${item.publishedAt}`} className="p-5">
                  <p className="text-xs text-muted flex flex-wrap items-center gap-x-1.5">
                    <span className="font-medium text-foreground-2">{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={item.publishedAt}>{formatPublishedDate(item.publishedAt)}</time>
                    <span aria-hidden="true">·</span>
                    <span className={cx(sentiment.className)}>{sentiment.text}</span>
                  </p>
                  <h2 className="mt-1.5 text-[15px] font-semibold leading-snug">{item.title}</h2>
                  <p className="mt-1 text-sm text-foreground-2 leading-relaxed">{item.summary}</p>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      {!isLoading && sources.length > 0 && (
        <section className="mt-5">
          <h2 className="text-xs font-medium text-muted mb-2 px-1">Sources for this briefing</h2>
          <ol className="grid gap-1.5 sm:grid-cols-2 px-1">
            {sources.map((source) => (
              <li key={source.url} className="min-w-0">
                <a href={source.url} target="_blank" rel="noreferrer" className="text-[13px] text-accent hover:underline inline-flex items-center gap-1 max-w-full">
                  <span className="truncate">{source.title}</span>
                  <ExternalLink size={12} className="shrink-0" />
                </a>
              </li>
            ))}
          </ol>
        </section>
      )}

      <p className="mt-5 text-xs text-muted px-1">Summaries are AI-generated from search results and may contain errors. Open the sources to confirm.</p>
    </div>
  )
}

function formatPublishedDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
