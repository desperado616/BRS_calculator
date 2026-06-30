import { useId, useState, type ReactNode } from 'react'

interface CollapsibleSectionProps {
  title: string
  description?: string
  defaultOpen?: boolean
  children: ReactNode
}

export function CollapsibleSection({
  title,
  description,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const contentId = useId()

  return (
    <section className="collapsible-section">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="collapsible-trigger flex w-full items-start justify-between gap-3 rounded-[var(--tg-radius)] border border-[var(--tg-card-border)] bg-[var(--tg-secondary-bg)] px-4 py-3.5 text-left shadow-[var(--tg-shadow)] transition-[background-color] active:bg-[var(--tg-bg)]"
        aria-expanded={open}
        aria-controls={contentId}
      >
        <span className="min-w-0">
          <span className="block text-sm font-semibold tracking-tight">{title}</span>
          {description && (
            <span className="mt-0.5 block text-xs leading-relaxed text-[var(--tg-hint)]">
              {description}
            </span>
          )}
        </span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          className={`mt-0.5 shrink-0 text-[var(--tg-hint)] transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div id={contentId} className="collapsible-content mt-3">
          {children}
        </div>
      )}
    </section>
  )
}
