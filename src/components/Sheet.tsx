'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cx } from '@/components/ui'

type SheetProps = {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  /** `center` is a dialog on desktop; `right` is a full-height side panel. Both are bottom sheets on mobile. */
  placement?: 'center' | 'right'
  bodyClassName?: string
}

export default function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  placement = 'center',
  bodyClassName,
}: SheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
      // showModal focuses the first focusable element (the close button); prefer the first form field.
      dialog.querySelector<HTMLElement>('input:not([type="hidden"]), textarea, select')?.focus()
      document.documentElement.style.overflow = 'hidden'
    } else if (!open && dialog.open) {
      dialog.close()
    }

    if (!open) document.documentElement.style.overflow = ''
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className={cx(
        'fixed inset-0 m-0 p-0 w-full h-full max-w-none max-h-none border-0 bg-overlay backdrop:bg-transparent',
        'flex-col justify-end open:flex animate-fade',
        placement === 'center' ? 'sm:items-center sm:justify-center sm:p-6' : 'sm:items-end sm:justify-stretch',
      )}
    >
      {open && (
        <div
          className={cx(
            'bg-surface text-foreground flex flex-col w-full max-h-[92dvh] rounded-t-2xl border-t border-border shadow-float animate-sheet',
            placement === 'center'
              ? 'sm:max-w-md sm:rounded-xl sm:border'
              : 'sm:h-full sm:max-h-none sm:max-w-[420px] sm:rounded-none sm:border-t-0 sm:border-l',
          )}
        >
          <div className="sm:hidden flex justify-center pt-2" aria-hidden="true">
            <span className="h-1 w-9 rounded-full bg-border-strong" />
          </div>
          <div className="flex items-start justify-between gap-4 px-5 pt-3 sm:pt-4 pb-3 border-b border-border">
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold">{title}</h2>
              {description && <p className="text-[13px] text-muted mt-0.5">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-mr-1.5 h-8 w-8 rounded-md flex items-center justify-center text-muted hover:bg-surface-2 hover:text-foreground"
              aria-label="Close"
            >
              <X size={17} />
            </button>
          </div>
          <div className={cx('flex-1 overflow-y-auto', bodyClassName ?? 'px-5 py-4')}>{children}</div>
          {footer && <div className="px-5 py-3 border-t border-border pb-[max(0.75rem,env(safe-area-inset-bottom))]">{footer}</div>}
        </div>
      )}
    </dialog>
  )
}
