import type { Assessment } from '../types'
import { formatDecimal } from '../utils/number'
import { Card } from './Card'
import { SectionHeader } from './SectionHeader'

interface AssessmentTableProps {
  assessments: Assessment[]
  onEdit: (assessment: Assessment) => void
  onDelete: (id: string) => void
}

export function AssessmentTable({
  assessments,
  onEdit,
  onDelete,
}: AssessmentTableProps) {
  if (assessments.length === 0) {
    return (
      <Card className="px-4 py-8 text-center">
        <p className="text-sm text-[var(--tg-hint)]">
          Добавьте контрольные точки для расчёта рейтинга.
        </p>
      </Card>
    )
  }

  return (
    <section className="space-y-3">
      <SectionHeader
        title="Контрольные точки"
        description={`${assessments.length} ${
          assessments.length === 1 ? 'точка' : 'точек'
        }`}
      />

      <ul className="space-y-2.5">
        {assessments.map((assessment) => {
          const isIntermediate = assessment.type === 'intermediate'
          const scorePercent =
            assessment.score !== null &&
            assessment.score !== undefined &&
            assessment.maxScore > 0
              ? (assessment.score / assessment.maxScore) * 100
              : 0

          return (
            <li key={assessment.id}>
              <Card className="p-4">
                <button
                  type="button"
                  onClick={() => onEdit(assessment)}
                  className="w-full text-left active:opacity-80"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium tracking-tight">
                        {assessment.name}
                      </p>
                      {isIntermediate ? (
                        <span className="mt-1 inline-block rounded-md bg-[var(--tg-accent-soft)] px-2 py-0.5 text-[0.6875rem] font-medium text-[var(--tg-accent)]">
                          Аттестация
                        </span>
                      ) : (
                        <p className="mt-1 text-xs text-[var(--tg-hint)]">
                          Вес {formatDecimal(assessment.weight)}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="stat-value text-lg">
                        {assessment.score !== null &&
                        assessment.score !== undefined
                          ? formatDecimal(assessment.score)
                          : '—'}
                        <span className="text-sm font-normal text-[var(--tg-hint)]">
                          {' '}
                          / {formatDecimal(assessment.maxScore)}
                        </span>
                      </p>
                    </div>
                  </div>

                  {!isIntermediate && assessment.score !== null && (
                    <div className="progress-track mt-3">
                      <div
                        className={
                          scorePercent >= 60
                            ? 'progress-fill progress-fill--pass'
                            : scorePercent > 0
                              ? 'progress-fill progress-fill--warn'
                              : 'progress-fill progress-fill--fail'
                        }
                        style={{ width: `${Math.min(100, scorePercent)}%` }}
                      />
                    </div>
                  )}
                </button>

                <div className="mt-3 flex gap-5 border-t border-[var(--tg-separator)] pt-3">
                  <button
                    type="button"
                    onClick={() => onEdit(assessment)}
                    className="text-link min-h-0 py-1"
                  >
                    Изменить
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Удалить «${assessment.name}»?`)) {
                        onDelete(assessment.id)
                      }
                    }}
                    className="min-h-0 py-1 text-sm font-medium text-[var(--tg-destructive)]"
                  >
                    Удалить
                  </button>
                </div>
              </Card>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
