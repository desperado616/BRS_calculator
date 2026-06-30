import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id ?? props.name

  return (
    <label className="block" htmlFor={inputId}>
      <span className="mb-1.5 block text-sm font-medium text-[var(--tg-hint)]">
        {label}
      </span>
      <input
        id={inputId}
        className={`w-full min-h-11 rounded-[calc(var(--tg-radius)-0.25rem)] border bg-[var(--tg-bg)] px-4 py-3 text-base text-[var(--tg-text)] outline-none transition-[border-color,box-shadow] duration-150 focus-visible:border-[var(--tg-accent)] focus-visible:ring-2 focus-visible:ring-[var(--tg-accent)]/25 ${
          error
            ? 'border-[var(--tg-destructive)]'
            : 'border-[var(--tg-separator)]'
        } ${className}`}
        {...props}
      />
      {error && (
        <span className="mt-1.5 block text-sm text-[var(--tg-destructive)]">
          {error}
        </span>
      )}
    </label>
  )
}
