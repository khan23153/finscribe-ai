import Link from 'next/link'

export function LogoMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
      <rect width="32" height="32" rx="8" fill="var(--accent)" />
      <path
        d="M9.5 11h13M9.5 16h9M9.5 21h5"
        stroke="var(--accent-fg)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function Logo({ href = '/', size = 24 }: { href?: string; size?: number }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 text-foreground" aria-label="FinScribe home">
      <LogoMark size={size} />
      <span className="text-[15px] font-semibold tracking-tight">FinScribe</span>
    </Link>
  )
}
