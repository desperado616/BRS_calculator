import type { ReactNode } from 'react'
import { BackButton } from './BackButton'
import { ThemeToggle } from './ThemeToggle'

interface LayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
  onBack?: () => void
  backLabel?: string
}

export function Layout({
  children,
  title,
  subtitle,
  onBack,
  backLabel,
}: LayoutProps) {
  return (
    <div className="app-shell min-h-screen bg-[var(--tg-bg)] text-[var(--tg-text)]">
      <header className="app-header sticky top-0 z-10 border-b border-[var(--tg-separator)] bg-[var(--tg-bg)]/85 backdrop-blur-md">
        <div className="page-content flex items-center gap-1 px-4 py-3">
          {onBack && <BackButton onClick={onBack} label={backLabel} />}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[1.0625rem] font-semibold tracking-tight">
              {title ?? 'BRS Calculator'}
            </h1>
            {subtitle && (
              <p className="mt-0.5 truncate text-xs text-[var(--tg-hint)]">
                {subtitle}
              </p>
            )}
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="app-main px-4 py-5">
        <div className="page-content">{children}</div>
      </main>
    </div>
  )
}
