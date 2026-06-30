import { useEffect, useMemo, useState } from 'react'
import {
  buildRatingSummary,
  formatGradeInfo,
  formatPercent,
  ratingToGradeInfo,
} from '../calculator'
import type { Assessment, Bonus, DisciplineType } from '../types'
import { clampScore } from '../utils/score'
import { formatDecimal, parseDecimalInput } from '../utils/number'
import { Button } from './Button'
import { Card } from './Card'
import { SectionHeader } from './SectionHeader'

interface WhatIfPanelProps {
  assessments: Assessment[]
  bonuses: Bonus[]
  disciplineType: DisciplineType
}

type OverrideInputs = Record<string, string>
type OverrideErrors = Record<string, string>

function buildSimulatedAssessments(
  assessments: Assessment[],
  inputs: OverrideInputs,
  errors: OverrideErrors,
): Assessment[] | null {
  const overrides: Record<string, number> = {}
  let hasOverride = false

  for (const assessment of assessments) {
    const raw = inputs[assessment.id]?.trim() ?? ''
    if (raw === '' || errors[assessment.id]) continue

    const parsed = parseDecimalInput(raw)
    if (parsed === null) continue

    overrides[assessment.id] = clampScore(parsed, assessment.maxScore)
    hasOverride = true
  }

  if (!hasOverride) return null

  return assessments.map((assessment) => {
    if (!(assessment.id in overrides)) return assessment
    return { ...assessment, score: overrides[assessment.id] }
  })
}

const inputClass =
  'w-full min-h-10 rounded-[calc(var(--tg-radius)-0.375rem)] border bg-[var(--tg-bg)] px-3 py-2.5 text-base tabular-nums outline-none transition-[border-color,box-shadow] duration-150 focus-visible:border-[var(--tg-accent)] focus-visible:ring-2 focus-visible:ring-[var(--tg-accent)]/25'

export function WhatIfPanel({
  assessments,
  bonuses,
  disciplineType,
}: WhatIfPanelProps) {
  const [inputs, setInputs] = useState<OverrideInputs>({})
  const [errors, setErrors] = useState<OverrideErrors>({})

  useEffect(() => {
    setInputs((current) => {
      const next: OverrideInputs = {}
      for (const assessment of assessments) {
        if (current[assessment.id] !== undefined) {
          next[assessment.id] = current[assessment.id]
        }
      }
      return next
    })
    setErrors({})
  }, [assessments])

  const currentSummary = useMemo(
    () => buildRatingSummary(assessments, bonuses, disciplineType),
    [assessments, bonuses, disciplineType],
  )

  const simulation = useMemo(() => {
    const simulated = buildSimulatedAssessments(assessments, inputs, errors)
    if (!simulated) return null
    return buildRatingSummary(simulated, bonuses, disciplineType)
  }, [assessments, bonuses, disciplineType, inputs, errors])

  const handleInputChange = (assessment: Assessment, value: string) => {
    setInputs((current) => ({ ...current, [assessment.id]: value }))

    if (value.trim() === '') {
      setErrors((current) => {
        const next = { ...current }
        delete next[assessment.id]
        return next
      })
      return
    }

    const parsed = parseDecimalInput(value)
    if (parsed === null) {
      setErrors((current) => ({
        ...current,
        [assessment.id]: 'Введите число',
      }))
      return
    }

    if (parsed < 0 || parsed > assessment.maxScore) {
      setErrors((current) => ({
        ...current,
        [assessment.id]: `От 0 до ${formatDecimal(assessment.maxScore)}`,
      }))
      return
    }

    setErrors((current) => {
      const next = { ...current }
      delete next[assessment.id]
      return next
    })
  }

  const handleReset = () => {
    setInputs({})
    setErrors({})
  }

  const hasActiveInputs = Object.values(inputs).some((value) => value.trim() !== '')

  if (assessments.length === 0) return null

  return (
    <section className="space-y-3" aria-live="polite">
      <SectionHeader
        title="Что будет если…"
        description="Введите баллы для одной или нескольких точек. Не сохраняется."
        action={
          hasActiveInputs ? (
            <button
              type="button"
              onClick={handleReset}
              className="text-link shrink-0 min-h-0 py-1"
            >
              Сбросить
            </button>
          ) : undefined
        }
      />

      <ul className="space-y-2">
        {assessments.map((assessment) => {
          const isIntermediate = assessment.type === 'intermediate'
          const currentScore =
            assessment.score !== null && assessment.score !== undefined
              ? formatDecimal(assessment.score)
              : '—'

          return (
            <li key={assessment.id}>
              <Card variant="inset" className="p-3">
                <p className="truncate text-sm font-medium tracking-tight">
                  {assessment.name}
                </p>
                <p className="mt-0.5 text-xs text-[var(--tg-hint)]">
                  Сейчас: {currentScore} / {formatDecimal(assessment.maxScore)}
                  {isIntermediate && ' · аттестация'}
                </p>

                <label className="mt-3 block">
                  <span className="mb-1 block text-xs font-medium text-[var(--tg-hint)]">
                    Предполагаемый балл
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={inputs[assessment.id] ?? ''}
                    onChange={(e) =>
                      handleInputChange(assessment, e.target.value)
                    }
                    placeholder="Не менять"
                    className={`${inputClass} ${
                      errors[assessment.id]
                        ? 'border-[var(--tg-destructive)]'
                        : 'border-[var(--tg-separator)]'
                    }`}
                  />
                </label>

                {errors[assessment.id] && (
                  <p className="mt-1 text-xs text-[var(--tg-destructive)]">
                    {errors[assessment.id]}
                  </p>
                )}
              </Card>
            </li>
          )
        })}
      </ul>

      {simulation && (
        <Card className="p-4">
          <p className="text-center text-sm font-medium text-[var(--tg-hint)]">
            Результат симуляции
          </p>

          <div className="mt-3 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-[calc(var(--tg-radius)-0.375rem)] bg-[var(--tg-bg)] px-2 py-3">
              <p className="stat-label">R_тек</p>
              <p className="stat-value mt-1 text-lg">
                {formatPercent(simulation.currentRating)}
              </p>
              {simulation.currentRating !== currentSummary.currentRating && (
                <p className="mt-1 text-[0.6875rem] text-[var(--tg-hint)]">
                  было {formatPercent(currentSummary.currentRating)}
                </p>
              )}
            </div>

            <div className="rounded-[calc(var(--tg-radius)-0.375rem)] bg-[var(--tg-accent-soft)] px-2 py-3">
              <p className="stat-label">R_d</p>
              <p className="stat-value mt-1 text-lg text-[var(--tg-accent)]">
                {formatPercent(simulation.displayRating)}
              </p>
              {simulation.displayRating !== currentSummary.displayRating && (
                <p className="mt-1 text-[0.6875rem] text-[var(--tg-hint)]">
                  было {formatPercent(currentSummary.displayRating)}
                </p>
              )}
            </div>
          </div>

          <p
            className={`mt-3 text-center text-sm font-semibold capitalize ${
              ratingToGradeInfo(
                simulation.finalRating ?? simulation.currentRating,
                disciplineType,
              ).isPassing
                ? 'text-[var(--tg-success)]'
                : 'text-[var(--tg-destructive)]'
            }`}
          >
            {formatGradeInfo(
              ratingToGradeInfo(
                simulation.finalRating ?? simulation.currentRating,
                disciplineType,
              ),
            )}
          </p>
        </Card>
      )}

      {hasActiveInputs && Object.keys(errors).length > 0 && (
        <Button variant="secondary" onClick={handleReset}>
          Очистить все поля
        </Button>
      )}
    </section>
  )
}
