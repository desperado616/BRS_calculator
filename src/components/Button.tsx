import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost'
  children: ReactNode
}

const variants = {
  primary:
    'border border-transparent bg-[var(--tg-button)] text-[var(--tg-button-text)] shadow-[var(--tg-shadow)] active:scale-[0.98]',
  secondary:
    'border border-[var(--tg-card-border)] bg-[var(--tg-secondary-bg)] text-[var(--tg-text)] shadow-[var(--tg-shadow)] active:scale-[0.98]',
  destructive:
    'border border-transparent bg-[var(--tg-destructive)] text-white shadow-[var(--tg-shadow)] active:scale-[0.98]',
  ghost:
    'border border-transparent bg-transparent text-[var(--tg-link)] active:opacity-70',
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-11 w-full items-center justify-center rounded-[var(--tg-radius)] px-4 py-3 text-[0.9375rem] font-medium transition-[transform,opacity] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tg-accent)]/40 disabled:pointer-events-none disabled:opacity-40 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
