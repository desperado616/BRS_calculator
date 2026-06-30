import { useEffect, useMemo, useState } from 'react'
import {
  formatPercent,
  getTargetOptions,
  planExamTarget,
} from '../calculator'
import type { Assessment, Bonus, DisciplineType } from '../types'
import { Card } from './Card'
import { SectionHeader } from './SectionHeader'

interface TargetPlannerPanelProps {
  assessments: Assessment[]
  bonuses: Bonus[]
  disciplineType: DisciplineType
  embedded?: boolean
}

export function TargetPlannerPanel({
  assessments,
  bonuses,
  disciplineType,
  embedded = false,
}: TargetPlannerPanelProps) {
  const options = useMemo(
    () => getTargetOptions(disciplineType),
    [disciplineType],
  )
  const [targetRating, setTargetRating] = useState(options[0]?.minRating ?? 60)

  useEffect(() => {
    setTargetRating(options[0]?.minRating ?? 60)
  }, [disciplineType, options])

  const plan = useMemo(
    () => planExamTarget(assessments, bonuses, disciplineType, targetRating),
    [assessments, bonuses, disciplineType, targetRating],
  )

  if (assessments.length === 0) return null

  return (
    <section className="space-y-3">
      {!embedded && (
        <SectionHeader
          title="Сколько нужно на аттестации?"
          description="Подберёт минимальный балл для выбранной цели"
        />
      )}

      <Card className="space-y-4 p-4">
        <label className="block">
          <span className="mb-2 block text-xs font-medium text-[var(--tg-hint)]">
            Цель
          </span>
          <select
            value={targetRating}
            onChange={(e) => setTargetRating(Number(e.target.value))}
            className="w-full rounded-[calc(var(--tg-radius)-0.375rem)] border border-[var(--tg-separator)] bg-[var(--tg-bg)] px-3 py-2.5 text-sm outline-none focus-visible:border-[var(--tg-accent)]"
          >
            {options.map((option) => (
              <option key={option.minRating} value={option.minRating}>
                {option.label} — от {option.minRating} %
              </option>
            ))}
          </select>
        </label>

        <div
          className={`rounded-[calc(var(--tg-radius)-0.375rem)] px-3 py-3 text-sm ${
            plan.alreadyAchieved || plan.achievable
              ? 'bg-[var(--tg-success)]/10 text-[var(--tg-success)]'
              : 'bg-[var(--tg-destructive)]/10 text-[var(--tg-destructive)]'
          }`}
        >
          {plan.message}
        </div>

        {plan.minScore !== null && !plan.alreadyAchieved && plan.achievable && (
          <div className="text-center">
            <p className="stat-label">Минимальный балл</p>
            <p className="stat-value mt-1 text-3xl text-[var(--tg-accent)]">
              {plan.minScore % 1 === 0
                ? plan.minScore
                : plan.minScore.toFixed(2).replace('.', ',')}
            </p>
            {plan.resultingRating !== null && (
              <p className="mt-2 text-xs text-[var(--tg-hint)]">
                R_d ≈ {formatPercent(plan.resultingRating)}
              </p>
            )}
          </div>
        )}

        {plan.canSkipExam && !plan.alreadyAchieved && (
          <p className="text-center text-xs text-[var(--tg-hint)]">
            При R_тек ≥ 60 % можно не сдавать аттестацию
          </p>
        )}
      </Card>
    </section>
  )
}
