import { memo, useMemo } from 'react'
import { buildRatingSummary, formatPercent } from '../calculator'
import { useNavigation } from '../navigation/AppNavigation'
import type { Subject } from '../types'
import { Card } from './Card'

interface SubjectListProps {
  subjects: Subject[]
}

function ChevronIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="shrink-0 text-[var(--tg-hint)]"
      aria-hidden
    >
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SubjectRow({ subject }: { subject: Subject }) {
  const { goSubject } = useNavigation()
  const summary = useMemo(
    () =>
      buildRatingSummary(
        subject.assessments,
        subject.bonuses,
        subject.disciplineType,
      ),
    [subject.assessments, subject.bonuses, subject.disciplineType],
  )

  const hasAssessments = subject.assessments.length > 0
  const typeLabel = subject.disciplineType === 'credit' ? 'Зачёт' : 'Экзамен'

  return (
    <li>
      <button
        type="button"
        onClick={() => goSubject(subject.id)}
        className="nav-link flex min-h-[3.25rem] w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-[var(--tg-bg)]"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium tracking-tight">{subject.name}</p>
          <p className="mt-0.5 text-xs text-[var(--tg-hint)]">{typeLabel}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="text-right">
            <p className="stat-value text-base text-[var(--tg-accent)]">
              {hasAssessments ? formatPercent(summary.displayRating) : '—'}
            </p>
            {hasAssessments && (
              <p
                className={`mt-0.5 text-[0.6875rem] font-medium capitalize ${
                  summary.gradeInfo.isPassing
                    ? 'text-[var(--tg-success)]'
                    : 'text-[var(--tg-destructive)]'
                }`}
              >
                {summary.gradeLabel}
              </p>
            )}
          </div>
          <ChevronIcon />
        </div>
      </button>
    </li>
  )
}

const MemoSubjectRow = memo(SubjectRow)

export function SubjectList({ subjects }: SubjectListProps) {
  if (subjects.length === 0) {
    return (
      <Card className="px-6 py-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--tg-accent-soft)] text-[var(--tg-accent)]">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </div>
        <p className="font-medium">Пока нет предметов</p>
        <p className="mt-1.5 text-sm text-[var(--tg-hint)]">
          Создайте первый — и начните считать рейтинг.
        </p>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden p-0">
      <ul className="divide-y divide-[var(--tg-separator)]">
        {subjects.map((subject) => (
          <MemoSubjectRow key={subject.id} subject={subject} />
        ))}
      </ul>
    </Card>
  )
}
