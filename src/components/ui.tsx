import type { ComponentPropsWithoutRef, ComponentType, ReactNode } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export { cx }

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-foreground hover:bg-accent-hover',
  secondary: 'bg-surface text-foreground border border-border hover:bg-surface-2 hover:border-border-strong',
  ghost: 'text-foreground-2 hover:bg-surface-2 hover:text-foreground',
  danger: 'bg-surface text-negative border border-border hover:bg-negative-soft hover:border-negative/40',
}

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-md',
  md: 'h-9 px-3.5 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-5 text-[15px] gap-2 rounded-lg',
}

export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) {
  return cx(
    'inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors select-none',
    'disabled:opacity-50 disabled:pointer-events-none',
    buttonVariants[variant],
    buttonSizes[size],
    className,
  )
}

type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClass(variant, size, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}

export function Card({ className, ...props }: ComponentPropsWithoutRef<'section'>) {
  return (
    <section
      className={cx('bg-surface border border-border rounded-xl shadow-card', className)}
      {...props}
    />
  )
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cx('flex items-start justify-between gap-4 px-5 pt-4 pb-3', className)}>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description && <p className="text-[13px] text-muted mt-0.5">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: ReactNode
  actions?: ReactNode
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
      <div className="min-w-0">
        <h1 className="text-[22px] sm:text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </header>
  )
}

const controlClass = cx(
  'w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground',
  'placeholder:text-subtle transition-colors',
  'hover:border-border-strong focus:outline-none focus:border-accent focus:ring-3 focus:ring-accent/15',
  'disabled:opacity-60',
)

export function Input({ className, ...props }: ComponentPropsWithoutRef<'input'>) {
  return <input className={cx(controlClass, className)} {...props} />
}

export function Select({ className, ...props }: ComponentPropsWithoutRef<'select'>) {
  return <select className={cx(controlClass, 'pr-8 appearance-none bg-no-repeat bg-[right_0.6rem_center] bg-[length:14px] select-chevron', className)} {...props} />
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: string
  htmlFor: string
  hint?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-foreground-2">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  )
}

type BadgeTone = 'neutral' | 'positive' | 'negative' | 'warning' | 'accent'

const badgeTones: Record<BadgeTone, string> = {
  neutral: 'bg-surface-2 text-foreground-2 border-border',
  positive: 'bg-accent-soft text-positive border-transparent',
  negative: 'bg-negative-soft text-negative border-transparent',
  warning: 'bg-warning-soft text-warning border-transparent',
  accent: 'bg-accent-soft text-accent border-transparent',
}

export function Badge({ tone = 'neutral', className, children }: { tone?: BadgeTone; className?: string; children: ReactNode }) {
  return (
    <span className={cx('inline-flex items-center gap-1 h-5 px-1.5 rounded-md border text-[11px] font-medium', badgeTones[tone], className)}>
      {children}
    </span>
  )
}

export function Alert({ children, tone = 'negative' }: { children: ReactNode; tone?: 'negative' | 'warning' }) {
  return (
    <div
      role={tone === 'negative' ? 'alert' : 'status'}
      className={cx(
        'flex items-start gap-2.5 rounded-lg px-3.5 py-2.5 text-sm',
        tone === 'negative' ? 'bg-negative-soft text-negative' : 'bg-warning-soft text-warning',
      )}
    >
      <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0">{children}</div>
    </div>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: ComponentType<{ size?: number; className?: string }>
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cx('flex flex-col items-center justify-center text-center px-6 py-10', className)}>
      <div className="w-10 h-10 rounded-lg bg-surface-2 border border-border flex items-center justify-center mb-3">
        <Icon size={18} className="text-muted" />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="text-[13px] text-muted mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx('rounded-md bg-surface-2 animate-pulse', className)} aria-hidden="true" />
}

export function Stat({
  label,
  value,
  detail,
  className,
}: {
  label: string
  value: ReactNode
  detail?: ReactNode
  className?: string
}) {
  return (
    <div className={cx('min-w-0', className)}>
      <p className="text-[13px] text-muted">{label}</p>
      <p className="mt-1 text-xl sm:text-2xl font-semibold tracking-tight text-foreground truncate">{value}</p>
      {detail && <p className="mt-0.5 text-xs text-muted truncate">{detail}</p>}
    </div>
  )
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: ReadonlyArray<NoInfer<T>> | ReadonlyArray<{ value: NoInfer<T>; label: string }>
  value: T
  onChange: (value: T) => void
  label: string
  className?: string
}) {
  const normalized = options.map((option) => (
    typeof option === 'string' ? { value: option, label: option } : option
  ))

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cx('inline-flex p-0.5 rounded-lg bg-surface-2 border border-border overflow-x-auto scrollbar-none max-w-full', className)}
    >
      {normalized.map((option) => {
        const isActive = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(option.value)}
            className={cx(
              'h-7 px-3 rounded-md text-[13px] font-medium whitespace-nowrap transition-colors',
              isActive
                ? 'bg-surface text-foreground shadow-card'
                : 'text-muted hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx(
        'relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors',
        checked ? 'bg-accent' : 'bg-border-strong',
      )}
    >
      <span
        className={cx(
          'inline-block h-5 w-5 rounded-full bg-white shadow-card transition-transform',
          checked ? 'translate-x-[18px]' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cx('animate-spin text-muted', className)} aria-label="Loading" />
}

/** Renders model output: paragraphs, bullet lists, and **bold** spans. */
export function Prose({ text }: { text: string }) {
  const blocks = text.trim().split(/\n{2,}/)

  return (
    <div className="space-y-3 text-sm leading-relaxed text-foreground-2">
      {blocks.map((block, blockIndex) => {
        const lines = block.split('\n').filter((line) => line.trim())
        const isList = lines.length > 0 && lines.every((line) => /^\s*([-*•]|\d+[.)])\s+/.test(line))

        if (isList) {
          return (
            <ul key={blockIndex} className="space-y-1.5">
              {lines.map((line, lineIndex) => (
                <li key={lineIndex} className="flex gap-2.5">
                  <span className="mt-[9px] h-1 w-1 rounded-full bg-subtle shrink-0" aria-hidden="true" />
                  <span>{renderInline(line.replace(/^\s*([-*•]|\d+[.)])\s+/, ''))}</span>
                </li>
              ))}
            </ul>
          )
        }

        return (
          <p key={blockIndex} className="whitespace-pre-line">
            {renderInline(block.replace(/^#{1,6}\s+/gm, ''))}
          </p>
        )
      })}
    </div>
  )
}

function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => (
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={index} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
      : part
  ))
}
