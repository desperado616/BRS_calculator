import { memo } from 'react'
import { formatBonus, formatPercent } from '../calculator'
import type { RatingSummary } from '../types'
import { Card } from './Card'

interface RatingDisplayProps {
  summary: RatingSummary
}

function progressClass(rating: number): string {
  if (rating >= 85) return 'progress-fill progress-fill--pass'
  if (rating >= 60) return 'progress-fill progress-fill--warn'
  return 'progress-fill progress-fill--fail'
}

function RatingDisplayInner({ summary }: RatingDisplayProps) {
  const gradeColor = summary.gradeInfo.isPassing
    ? 'text-[var(--tg-success)]'
    : 'text-[var(--tg-destructive)]'

  const displayValue =
    summary.finalRating ??
    (summary.canSkipExam && summary.waivedRating !== null
      ? summary.waivedRating
      : summary.preliminaryRating)

  const displayLabel =
    summary.finalRating !== null
      ? 'R_d — итоговый рейтинг'
      : summary.canSkipExam && summary.waivedRating !== null
        ? 'R_d — без аттестации'
        : 'R_d — предварительно'

  const displayHint =
    summary.finalRating !== null
      ? '0.6 × R_тек + 0.4 × R_pa + R_b'
      : summary.canSkipExam && summary.waivedRating !== null
        ? 'R_тек + R_b · можно не сдавать'
        : '0.6 × R_тек + R_b'

  return (
    <Card variant="hero" className="p-4 sm:p-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="stat-label">R_тек</p>
          <p className="stat-value mt-1 text-2xl sm:text-[1.75rem]">
            {formatPercent(summary.currentRating)}
          </p>
          <div className="progress-track mt-2.5">
            <div
              className={progressClass(summary.currentRating)}
              style={{ width: `${Math.min(100, summary.currentRating)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--tg-hint)]">текущий контроль</p>
          <p className={`mt-1.5 text-sm font-semibold capitalize ${gradeColor}`}>
            {summary.gradeLabel}
          </p>
        </div>

        <div>
          <p className="stat-label">R_b</p>
          <p
            className={`stat-value mt-1 text-2xl sm:text-[1.75rem] ${
              summary.bonusRating > 0
                ? 'text-[var(--tg-success)]'
                : summary.bonusRating < 0
                  ? 'text-[var(--tg-destructive)]'
                  : ''
            }`}
          >
            {formatBonus(summary.bonusRating)}
          </p>
          <p className="mt-2 text-xs text-[var(--tg-hint)]">бонус-рейтинг</p>
        </div>
      </div>

      {summary.intermediateRating !== null && (
        <div className="mt-4 border-t border-[var(--tg-separator)] pt-4">
          <p className="stat-label">R_pa</p>
          <p className="stat-value mt-1 text-xl sm:text-2xl">
            {formatPercent(summary.intermediateRating)}
          </p>
          <p className="mt-1 text-xs text-[var(--tg-hint)]">
            промежуточная аттестация
          </p>
        </div>
      )}

      <div className="mt-4 rounded-[calc(var(--tg-radius)-0.25rem)] bg-[var(--tg-accent-soft)] px-4 py-4 text-center">
        <p className="text-sm font-medium text-[var(--tg-hint)]">{displayLabel}</p>
        <p className="stat-value mt-1 text-3xl text-[var(--tg-accent)] sm:text-4xl">
          {formatPercent(displayValue)}
        </p>
        <p className="mt-1 text-xs text-[var(--tg-hint)]">{displayHint}</p>
        {summary.finalRating !== null ||
        (summary.canSkipExam && summary.waivedRating !== null) ? (
          <p className={`mt-2 text-sm font-semibold capitalize ${gradeColor}`}>
            {summary.gradeLabel}
          </p>
        ) : null}
      </div>
    </Card>
  )
}

export const RatingDisplay = memo(RatingDisplayInner)
