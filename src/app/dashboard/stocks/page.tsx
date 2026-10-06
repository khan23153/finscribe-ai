'use client'

import { useState } from 'react'
import { ExternalLink, LineChart, Search } from 'lucide-react'
import {
  Alert,
  Button,
  Card,
  EmptyState,
  Input,
  PageHeader,
  Prose,
  Skeleton,
} from '@/components/ui'

type Source = { title: string; url: string }

const suggestions = ['Reliance Industries', 'TCS', 'HDFC Bank', 'Infosys', 'Tata Motors', 'NIFTY 50 index funds']

export default function StocksPage() {
  const [query, setQuery] = useState('')
  const [researched, setResearched] = useState('')
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [sources, setSources] = useState<Source[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const research = async (subject: string) => {
    const trimmed = subject.trim()
    if (!trimmed || isLoading) return

    setQuery(trimmed)
    setResearched(trimmed)
    setIsLoading(true)
    setAnalysis(null)
    setSources([])
    setError(null)

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'stocks',
          messages: [{
            role: 'user',
            content: `Research ${trimmed} for an Indian retail investor. Summarize current public information, distinguish short-term uncertainty from long-term factors, and give three key points.`,
          }],
        }),
      })
      const data = await response.json() as { reply?: string; error?: string; sources?: Source[] }
      if (!response.ok || !data.reply) throw new Error(data.error ?? 'Unable to research this company.')
      setAnalysis(data.reply)
      setSources(data.sources ?? [])
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to research this company.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Stock research"
        description="A source-linked briefing on any listed Indian company, compiled from a live web search."
      />

      <form
        onSubmit={(event) => {
          event.preventDefault()
          void research(query)
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle pointer-events-none" />
          <label htmlFor="stock-query" className="sr-only">Company name or symbol</label>
          <Input
            id="stock-query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Company name or NSE symbol"
            className="pl-9 h-11"
            maxLength={120}
          />
        </div>
        <Button type="submit" size="lg" loading={isLoading} disabled={!query.trim()}>
          Research
        </Button>
      </form>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => void research(suggestion)}
            disabled={isLoading}
            className="h-7 px-2.5 rounded-md border border-border text-[13px] text-foreground-2 hover:bg-surface-2 hover:text-foreground disabled:opacity-50"
          >
            {suggestion}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {error && <Alert>{error}</Alert>}

        {isLoading && (
          <Card className="p-5 sm:p-6 space-y-3">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full mt-5" />
            <Skeleton className="h-4 w-2/3" />
          </Card>
        )}

        {!isLoading && analysis && (
          <Card className="p-5 sm:p-6">
            <h2 className="text-[15px] font-semibold">{researched}</h2>
            <p className="text-xs text-muted mt-0.5 mb-4">AI briefing · verify against the sources below</p>
            <Prose text={analysis} />

            {sources.length > 0 && (
              <div className="mt-6 pt-4 border-t border-border">
                <h3 className="text-xs font-medium text-muted mb-2">Sources</h3>
                <ol className="space-y-1.5">
                  {sources.map((source, index) => (
                    <li key={source.url} className="flex gap-2 text-[13px]">
                      <span className="text-subtle tabular w-4 shrink-0">{index + 1}.</span>
                      <a href={source.url} target="_blank" rel="noreferrer" className="text-accent hover:underline inline-flex items-center gap-1 min-w-0">
                        <span className="truncate">{source.title}</span>
                        <ExternalLink size={12} className="shrink-0" />
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </Card>
        )}

        {!isLoading && !analysis && !error && (
          <Card>
            <EmptyState
              icon={LineChart}
              title="Search for a company"
              description="You'll get recent developments, long-term factors, and key points with links to where they came from."
            />
          </Card>
        )}

        <p className="mt-4 text-xs text-muted leading-relaxed">
          For education only. FinScribe is not a registered investment adviser and does not show live prices.
          Market investments carry risk; read all related documents before investing.
        </p>
      </div>
    </div>
  )
}
