import Link from 'next/link'

const highlights = [
  {
    title: 'Expense tracking',
    description: 'Keep account-scoped records and review monthly totals.',
  },
  {
    title: 'Practical reports',
    description: 'See category breakdowns and six-month spending trends.',
  },
  {
    title: 'Source-aware AI',
    description: 'Research financial topics with grounded source links.',
  },
]

export default function AuthMarketingPanel() {
  return (
    <aside className="hidden lg:flex flex-col justify-between bg-surface p-12 border-r border-border relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-accent-glow rounded-full blur-3xl pointer-events-none" />

      <div className="z-10">
        <Link href="/" className="font-display font-bold text-2xl flex items-center gap-2 mb-16">
          FinScribe <span className="w-2 h-2 rounded-full bg-accent inline-block" /> AI
        </Link>
        <h1 className="font-display text-4xl font-bold leading-tight mb-6 max-w-md">
          Financial clarity starts with records you can understand.
        </h1>
        <p className="text-muted text-lg max-w-md">
          Track expenses, review trends, and use AI-assisted educational tools from one dashboard.
        </p>
      </div>

      <div className="z-10 space-y-4 mb-12">
        {highlights.map((highlight, index) => (
          <div key={highlight.title} className="bg-background/50 border border-border p-4 rounded-xl max-w-md backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center font-mono font-bold text-accent text-sm shrink-0">
                {index + 1}
              </span>
              <div>
                <h2 className="font-medium text-sm">{highlight.title}</h2>
                <p className="text-sm text-muted mt-1">{highlight.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="z-10 flex items-center gap-2 text-sm text-muted">
        <span className="w-2.5 h-2.5 rounded-full bg-accent" />
        Authenticated account access powered by Clerk
      </div>
    </aside>
  )
}
