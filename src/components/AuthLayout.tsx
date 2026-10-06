import type { ReactNode } from 'react'
import Link from 'next/link'
import { LogoMark } from '@/components/Logo'

/** Clerk appearance that reads the app's theme tokens, so it follows light and dark mode. */
export const clerkAppearance = {
  variables: {
    colorPrimary: 'var(--accent)',
    colorPrimaryForeground: 'var(--accent-fg)',
    colorBackground: 'var(--surface)',
    colorForeground: 'var(--fg)',
    colorMutedForeground: 'var(--muted)',
    colorNeutral: 'var(--fg)',
    colorInput: 'var(--surface)',
    colorInputForeground: 'var(--fg)',
    colorBorder: 'var(--border)',
    colorDanger: 'var(--negative)',
    fontFamily: 'var(--font-geist-sans)',
    borderRadius: '0.625rem',
  },
  elements: {
    cardBox: 'shadow-none border border-border',
    card: 'shadow-none',
  },
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col pt-safe pb-safe">
      <header className="h-16 flex items-center px-6">
        <Link href="/" className="inline-flex items-center gap-2" aria-label="FinScribe home">
          <LogoMark size={24} />
          <span className="text-[15px] font-semibold tracking-tight">FinScribe</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 pb-16">
        {children}
      </main>
      <footer className="py-6 text-center text-xs text-muted">
        Educational tools only — not financial advice.
      </footer>
    </div>
  )
}
