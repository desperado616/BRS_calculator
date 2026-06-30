import type { KeyboardEvent } from 'react'
import { Card } from './Card'

interface SubjectSearchProps {
  value: string
  onChange: (value: string) => void
  resultCount: number
}

export function SubjectSearch({
  value,
  onChange,
  resultCount,
}: SubjectSearchProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape' && value) {
      event.preventDefault()
      onChange('')
    }
  }

  return (
    <Card className="p-3">
      <label className="block">
        <span className="sr-only">Поиск предметов</span>
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Поиск по названию…"
          enterKeyHint="search"
          className="search-input w-full rounded-[calc(var(--tg-radius)-0.375rem)] border border-[var(--tg-separator)] bg-[var(--tg-bg)] px-3 py-2.5 text-sm outline-none transition-[border-color,box-shadow] focus-visible:border-[var(--tg-accent)] focus-visible:ring-2 focus-visible:ring-[var(--tg-accent)]/25"
        />
      </label>
      {value.trim() && (
        <p className="mt-2 text-xs text-[var(--tg-hint)]">
          Найдено: {resultCount}
        </p>
      )}
    </Card>
  )
}
