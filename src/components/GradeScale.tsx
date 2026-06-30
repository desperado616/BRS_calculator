import type { DisciplineType } from '../types'

interface GradeScaleProps {
  rating: number
  disciplineType: DisciplineType
}

const EXAM_BANDS = [
  { label: '2', width: 60, color: 'var(--tg-destructive)' },
  { label: '3', width: 15, color: '#f59e0b' },
  { label: '4', width: 10, color: 'var(--tg-accent)' },
  { label: '5', width: 15, color: 'var(--tg-success)' },
]

export function GradeScale({ rating, disciplineType }: GradeScaleProps) {
  const marker = Math.min(100, Math.max(0, rating))

  if (disciplineType === 'credit') {
    return (
      <div className="space-y-2">
        <div className="relative h-2 overflow-hidden rounded-full bg-[var(--tg-separator)]">
          <div
            className="absolute inset-y-0 left-0 rounded-l-full bg-[var(--tg-destructive)]/70"
            style={{ width: '60%' }}
          />
          <div
            className="absolute inset-y-0 rounded-r-full bg-[var(--tg-success)]/80"
            style={{ left: '60%', width: '40%' }}
          />
          <div
            className="grade-marker absolute top-1/2 h-4 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--tg-text)] shadow"
            style={{ left: `${marker}%` }}
          />
        </div>
        <div className="flex justify-between text-[0.6875rem] text-[var(--tg-hint)]">
          <span>незачтено</span>
          <span>зачтено (≥ 60 %)</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="relative flex h-2 overflow-hidden rounded-full">
        {EXAM_BANDS.map((band) => (
          <div
            key={band.label}
            className="h-full"
            style={{
              width: `${band.width}%`,
              background: band.color,
              opacity: 0.85,
            }}
          />
        ))}
        <div
          className="grade-marker absolute top-1/2 h-4 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--tg-text)] shadow"
          style={{ left: `${marker}%` }}
        />
      </div>
      <div className="grid grid-cols-4 text-center text-[0.6875rem] text-[var(--tg-hint)]">
        {EXAM_BANDS.map((band) => (
          <span key={band.label}>{band.label}</span>
        ))}
      </div>
    </div>
  )
}
