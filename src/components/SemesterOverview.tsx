import { useMemo } from 'react'
import { buildRatingSummary, formatPercent } from '../calculator'
import type { Subject } from '../types'
import { Card } from './Card'

interface SemesterOverviewProps {
  subjects: Subject[]
}

export function SemesterOverview({ subjects }: SemesterOverviewProps) {
  const stats = useMemo(() => {
    let ratedCount = 0
    let passingCount = 0
    let atRiskCount = 0
    let ratingSum = 0

    for (const subject of subjects) {
      if (subject.assessments.length === 0) continue

      const summary = buildRatingSummary(
        subject.assessments,
        subject.bonuses,
        subject.disciplineType,
      )

      ratedCount += 1
      ratingSum += summary.displayRating
      if (summary.gradeInfo.isPassing) passingCount += 1
      else atRiskCount += 1
    }

    return {
      total: subjects.length,
      ratedCount,
      passingCount,
      atRiskCount,
      averageRating: ratedCount > 0 ? ratingSum / ratedCount : null,
    }
  }, [subjects])

  if (stats.total === 0) return null

  return (
    <Card className="overview-card p-4">
      <p className="stat-label">Обзор семестра</p>
      <div className="mt-3 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-[calc(var(--tg-radius)-0.375rem)] bg-[var(--tg-bg)] px-2 py-3">
          <p className="stat-value text-xl">{stats.total}</p>
          <p className="mt-1 text-[0.6875rem] text-[var(--tg-hint)]">предметов</p>
        </div>
        <div className="rounded-[calc(var(--tg-radius)-0.375rem)] bg-[var(--tg-success)]/10 px-2 py-3">
          <p className="stat-value text-xl text-[var(--tg-success)]">
            {stats.passingCount}
          </p>
          <p className="mt-1 text-[0.6875rem] text-[var(--tg-hint)]">в норме</p>
        </div>
        <div className="rounded-[calc(var(--tg-radius)-0.375rem)] bg-[var(--tg-destructive)]/10 px-2 py-3">
          <p className="stat-value text-xl text-[var(--tg-destructive)]">
            {stats.atRiskCount}
          </p>
          <p className="mt-1 text-[0.6875rem] text-[var(--tg-hint)]">под угрозой</p>
        </div>
      </div>
      {stats.averageRating !== null && (
        <p className="mt-3 text-center text-sm text-[var(--tg-hint)]">
          Средний рейтинг:{' '}
          <span className="font-semibold text-[var(--tg-accent)]">
            {formatPercent(stats.averageRating)}
          </span>
        </p>
      )}
    </Card>
  )
}
