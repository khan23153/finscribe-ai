import type { Metadata } from 'next'
import { WifiOff } from 'lucide-react'
import { LogoMark } from '@/components/Logo'

export const metadata: Metadata = {
  title: 'Offline',
}

export default function OfflinePage() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 text-center pt-safe pb-safe">
      <LogoMark size={36} />
      <div className="mt-8 w-11 h-11 rounded-lg bg-surface border border-border flex items-center justify-center">
        <WifiOff size={18} className="text-muted" />
      </div>
      <h1 className="mt-4 text-lg font-semibold">You&apos;re offline</h1>
      <p className="mt-1 text-sm text-muted max-w-xs">
        FinScribe needs a connection to load your records. Reconnect and try again.
      </p>
      <a
        href="/dashboard"
        className="mt-6 inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
      >
        Try again
      </a>
    </main>
  )
}
