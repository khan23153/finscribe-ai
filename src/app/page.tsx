"use client";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export default function LandingPage() {
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden overflow-x-hidden">
      {/* Dynamic Background */}
      <div
        className="pointer-events-none absolute inset-0 bg-background"
        style={{
          backgroundImage: `
            radial-gradient(circle at center, var(--color-accent-glow) 0%, transparent 60%),
            radial-gradient(var(--color-border) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 20px 20px'
        }}
      />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-border bg-background/80 rounded-none">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-2xl font-black flex items-center gap-1">
            FinScribe <span className="w-2 h-2 rounded-full bg-accent inline-block" /> AI
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="#features" className="hover:text-accent transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-accent transition-colors">How It Works</Link>
            {isSignedIn && (
              <Link href="/dashboard" className="hover:text-accent transition-colors">Dashboard</Link>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="bg-accent hover:bg-accent-dark text-background px-5 py-2.5 rounded-xl transition-colors text-sm font-bold"
              >
                Open Dashboard
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className="hover:text-accent transition-colors">Sign In</Link>
                <Link
                  href="/sign-up"
                  className="bg-accent hover:bg-accent-dark text-background px-5 py-2.5 rounded-xl transition-colors text-sm font-bold"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-6 md:px-8 py-20 lg:py-32 w-full overflow-hidden flex flex-col items-center text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/20 bg-accent/5 mb-8">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-sm font-medium text-accent">AI-Powered Finance</span>
        </div>

        <div className="px-4 max-w-full overflow-x-hidden w-full flex flex-col items-center">
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-none break-words w-full font-black tracking-tighter mb-6">
            Your Money,<br />
            <span className="text-accent">Understood.</span>
          </h1>

          <p className="text-muted text-lg md:text-xl max-w-2xl mb-10">
            Stop guessing, start growing. FinScribe AI turns your transactions into actionable financial intelligence.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 relative">
          <Link
            href={isSignedIn ? "/dashboard" : "/sign-up"}
            className="bg-accent hover:bg-accent-dark text-background px-10 py-4 rounded-2xl font-bold text-base shadow-lg shadow-accent/25 transition-colors w-full sm:w-auto"
          >
            {isSignedIn ? "Open Dashboard" : "Start Free"}
          </Link>
          <Link
            href="/dashboard"
            className="px-10 py-4 rounded-2xl font-bold text-base border border-border hover:border-accent hover:bg-surface transition-colors w-full sm:w-auto"
          >
            See Dashboard &rarr;
          </Link>

          {/* Floating Stat Card 1 */}
          <div className="hidden lg:flex absolute -left-48 top-4 flex-col gap-1 bg-surface/80 backdrop-blur-xl border border-border border-accent/20 p-4 rounded-xl shadow-2xl rotate-[-2deg]">
            <div className="flex items-center gap-2 text-sm text-muted">
              <span>Monthly view</span>
              <span className="text-accent flex items-center">Your data</span>
            </div>
            <div className="font-display text-xl font-bold">Recorded expenses</div>
          </div>

          {/* Floating Stat Card 2 */}
          <div className="hidden lg:flex absolute -right-48 -bottom-12 flex-col gap-1 bg-surface/80 backdrop-blur-xl border border-border border-accent/20 p-4 rounded-xl shadow-2xl rotate-[3deg]">
            <div className="flex items-center gap-2 text-sm text-muted">
              <span>&#129302; AI research</span>
            </div>
            <div className="font-display text-xl font-bold text-accent">Grounded sources</div>
          </div>
        </div>
        </div>
      </main>

      {/* Stats Bar */}
      <section className="py-12 border-y border-border relative z-10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-border">
          <div>
            <div className="font-mono text-3xl font-black mb-1">Manual</div>
            <div className="text-muted text-sm uppercase tracking-wide">Expense entry</div>
          </div>
          <div>
            <div className="font-mono text-3xl font-black mb-1">6 months</div>
            <div className="text-muted text-sm uppercase tracking-wide">Trend view</div>
          </div>
          <div>
            <div className="font-mono text-3xl font-black mb-1">5 steps</div>
            <div className="text-muted text-sm uppercase tracking-wide">Personal setup</div>
          </div>
          <div>
            <div className="font-mono text-3xl font-black mb-1">Source-linked</div>
            <div className="text-muted text-sm uppercase tracking-wide">Market research</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-center mb-16">
            Everything you need to master your finances
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🧠', title: 'AI Insights', desc: 'Analysis based only on the financial figures you provide' },
              { icon: '📊', title: 'Visual Reports', desc: 'Beautiful charts that make data easy to read' },
              { icon: '🔒', title: 'Account Isolation', desc: 'Authenticated routes and owner-scoped expense records' },
              { icon: '⚡', title: 'Persistent Expenses', desc: 'Recorded expenses are stored with your signed-in account' },
              { icon: '📁', title: 'Clear Categories', desc: 'Organize expenses into seven practical categories' },
              { icon: '🎯', title: 'Goal Tracking', desc: 'Set targets and keep progress saved in this browser' },
            ].map((f, i) => (
              <div key={i} className="bg-surface border border-border rounded-2xl p-8 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10 hover:border-l-4 hover:border-l-accent transition-all group">
                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform origin-left">{f.icon}</div>
                <h3 className="font-display font-bold text-xl mb-3">{f.title}</h3>
                <p className="text-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-surface/50 relative z-10 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-center mb-16">
            Get started in minutes
          </h2>
          <div className="grid md:grid-cols-3 gap-12 text-center">
            {[
              { step: '01', title: 'Create Your Account', desc: 'Sign up securely and open your private dashboard' },
              { step: '02', title: 'Take the Financial Quiz', desc: 'Discover your spending personality' },
              { step: '03', title: 'Record and Review', desc: 'Add expenses, inspect reports, and request AI analysis' },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center relative bg-surface border border-border rounded-2xl p-8 hover:border-accent/30 transition-all shadow-sm hover:shadow-md">
                <div className="font-mono text-8xl font-black text-accent/20 mb-4">{s.step}</div>
                <h3 className="font-display font-bold text-xl mb-3">{s.title}</h3>
                <p className="text-muted">{s.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 -right-6 w-12 border-t-2 border-dashed border-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-auto relative z-10 bg-background">
        <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-lg">FinScribe AI</span>
            <span className="text-muted text-sm">&mdash; Intelligent Financial Ledger</span>
          </div>
          <p className="text-sm text-muted">Educational tools only; not financial advice.</p>
          <div className="text-sm text-muted/60">
            &copy; {new Date().getFullYear()} FinScribe AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
