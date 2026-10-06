import Link from 'next/link'
import { Show } from '@clerk/nextjs'
import {
  ArrowRight,
  BarChart3,
  BookUser,
  Calculator,
  MessageSquare,
  Receipt,
  Smartphone,
  Target,
  UtensilsCrossed,
  Car,
  Zap,
} from 'lucide-react'
import Logo from '@/components/Logo'
import { buttonClass } from '@/components/ui'

const features = [
  {
    icon: Receipt,
    title: 'Expense log',
    description: 'Record a purchase in a few taps. Search, filter by category, and review day by day.',
  },
  {
    icon: BarChart3,
    title: 'Monthly picture',
    description: 'See this month against last, your six-month trend, and which categories take the most.',
  },
  {
    icon: Target,
    title: 'Budget and goals',
    description: 'Set a monthly limit and savings targets. FinScribe shows what is left and what to set aside.',
  },
  {
    icon: Calculator,
    title: 'Loan calculator',
    description: 'Work out EMIs, total interest, and a full repayment schedule before you borrow.',
  },
  {
    icon: BookUser,
    title: 'Personal ledger',
    description: 'Keep track of money lent to or owed by customers, suppliers, and friends.',
  },
  {
    icon: MessageSquare,
    title: 'Assistant and research',
    description: 'Ask finance questions, and get company and news briefings with links to their sources.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-md border-b border-border pt-safe">
        <div className="mx-auto max-w-6xl h-16 px-5 sm:px-8 flex items-center justify-between">
          <Logo />
          <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main">
            <a href="#features" className="hidden sm:inline-flex h-9 items-center px-3 text-sm text-foreground-2 hover:text-foreground">Features</a>
            <a href="#app" className="hidden sm:inline-flex h-9 items-center px-3 text-sm text-foreground-2 hover:text-foreground">Install</a>
            <Show
              when="signed-in"
              fallback={
                <>
                  <Link href="/sign-in" className={buttonClass('ghost', 'md')}>Sign in</Link>
                  <Link href="/sign-up" className={buttonClass('primary', 'md')}>Get started</Link>
                </>
              }
            >
              <Link href="/dashboard" className={buttonClass('primary', 'md')}>Open app</Link>
            </Show>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-5 sm:px-8 pt-16 sm:pt-24 pb-16 grid gap-14 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <div>
            <p className="text-sm font-medium text-accent">Personal finance, in rupees</p>
            <h1 className="mt-4 text-[40px] leading-[1.05] sm:text-[56px] font-semibold tracking-[-0.03em] text-foreground">
              Know where your money goes.
            </h1>
            <p className="mt-5 text-lg text-foreground-2 leading-relaxed max-w-xl">
              FinScribe is a simple ledger for everyday spending. Record expenses in seconds, see your month
              at a glance, and plan loans and savings goals on the web or as an app on your phone.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Show
                when="signed-in"
                fallback={
                  <>
                    <Link href="/sign-up" className={buttonClass('primary', 'lg')}>
                      Create a free account <ArrowRight size={16} />
                    </Link>
                    <Link href="/sign-in" className={buttonClass('secondary', 'lg')}>I already have an account</Link>
                  </>
                }
              >
                <Link href="/dashboard" className={buttonClass('primary', 'lg')}>
                  Open FinScribe <ArrowRight size={16} />
                </Link>
              </Show>
            </div>
          </div>

          <ProductPreview />
        </section>

        <section id="features" className="border-t border-border bg-surface">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight max-w-lg">
              Everything you need to keep your finances in order.
            </h2>
            <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <div key={feature.title}>
                    <span className="h-9 w-9 rounded-lg bg-accent-soft text-accent flex items-center justify-center">
                      <Icon size={18} />
                    </span>
                    <h3 className="mt-4 text-[15px] font-semibold">{feature.title}</h3>
                    <p className="mt-1.5 text-sm text-foreground-2 leading-relaxed">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section id="app" className="border-t border-border">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20 grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="h-9 w-9 rounded-lg bg-surface border border-border flex items-center justify-center">
                <Smartphone size={18} className="text-foreground-2" />
              </span>
              <h2 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight">Install it like an app.</h2>
              <p className="mt-3 text-foreground-2 leading-relaxed max-w-md">
                Add FinScribe to your home screen from your browser. It opens full screen with its own icon,
                and a tab bar for quick access. There is nothing to download from an app store.
              </p>
            </div>
            <ol className="grid gap-3 text-sm">
              {[
                ['Android and desktop', 'Open FinScribe in Chrome or Edge and choose “Install app”.'],
                ['iPhone and iPad', 'Open it in Safari, tap Share, then “Add to Home Screen”.'],
                ['Your data', 'Expenses sync to your account. Goals, ledger, and preferences stay on the device.'],
              ].map(([title, body]) => (
                <li key={title} className="rounded-xl border border-border bg-surface p-4">
                  <p className="font-medium">{title}</p>
                  <p className="mt-1 text-foreground-2">{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className="border-t border-border pb-safe">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-8 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-[13px] text-muted">
          <Logo />
          <p>Educational tools only — not financial advice.</p>
        </div>
      </footer>
    </div>
  )
}

/** A static illustration of the Home screen, with example figures. */
function ProductPreview() {
  const bars = [46, 58, 40, 64, 52, 72]
  const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']
  const rows = [
    { icon: UtensilsCrossed, title: 'Groceries', meta: 'Food · Today', amount: '₹1,240' },
    { icon: Zap, title: 'Electricity bill', meta: 'Bills · Yesterday', amount: '₹2,180' },
    { icon: Car, title: 'Metro card top-up', meta: 'Transport · 3 Oct', amount: '₹500' },
  ]

  return (
    <div className="relative" aria-label="Example of the FinScribe home screen" role="img">
      <div className="rounded-2xl border border-border bg-surface shadow-float overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-border">
          <p className="text-[13px] text-muted">Spent this month</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight tabular">₹38,420</p>
          <div className="mt-4 h-2 rounded-full bg-surface-2 overflow-hidden">
            <div className="h-full w-[64%] rounded-full bg-accent" />
          </div>
          <div className="mt-2 flex justify-between text-[13px]">
            <span className="text-foreground-2">₹21,580 left</span>
            <span className="text-muted tabular">of ₹60,000</span>
          </div>
        </div>
        <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-border">
          <div className="flex items-end gap-2.5 h-24 border-b border-border-strong">
            {bars.map((height, index) => (
              <span
                key={months[index]}
                className={`flex-1 rounded-t-[3px] ${index === bars.length - 1 ? 'bg-accent' : 'bg-accent/30'}`}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className="flex gap-2.5 mt-1.5">
            {months.map((month) => <span key={month} className="flex-1 text-center text-[10px] text-muted">{month}</span>)}
          </div>
        </div>
        <ul className="divide-y divide-border">
          {rows.map((row) => {
            const Icon = row.icon
            return (
              <li key={row.title} className="flex items-center gap-3 px-5 sm:px-6 py-3">
                <span className="h-8 w-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-foreground-2">
                  <Icon size={15} strokeWidth={1.8} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium">{row.title}</p>
                  <p className="text-[11px] text-muted">{row.meta}</p>
                </div>
                <p className="text-[13px] font-medium tabular">−{row.amount}</p>
              </li>
            )
          })}
        </ul>
      </div>
      <p className="mt-3 text-center text-xs text-subtle">Example figures</p>
    </div>
  )
}
