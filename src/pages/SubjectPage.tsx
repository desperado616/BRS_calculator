import { useCallback, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { buildRatingSummary } from '../calculator'
import { AssessmentForm } from '../components/AssessmentForm'
import { AssessmentTable } from '../components/AssessmentTable'
import { BonusPanel } from '../components/BonusPanel'
import { DisciplineTypeSelector } from '../components/DisciplineTypeSelector'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Layout } from '../components/Layout'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { RatingDisplay } from '../components/RatingDisplay'
import { WhatIfPanel } from '../components/WhatIfPanel'
import { useSubject } from '../hooks/useSubjects'
import { useTelegramBackButton } from '../hooks/useTelegram'
import { deleteSubject } from '../storage/db'
import type { Assessment, Bonus } from '../types'

type FormMode = 'closed' | 'add' | 'edit'

export function SubjectPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { subject, loading, saving, saveError, updateAssessments, updateBonuses, updateDisciplineType } =
    useSubject(id)
  const [formMode, setFormMode] = useState<FormMode>('closed')
  const [editingAssessment, setEditingAssessment] = useState<
    Assessment | undefined
  >()

  const goBack = useCallback(() => navigate('/'), [navigate])
  useTelegramBackButton(true, goBack)

  const summary = useMemo(
    () =>
      buildRatingSummary(
        subject?.assessments ?? [],
        subject?.bonuses ?? [],
        subject?.disciplineType ?? 'exam',
      ),
    [subject?.assessments, subject?.bonuses, subject?.disciplineType],
  )

  const hasIntermediate = useMemo(
    () =>
      (subject?.assessments ?? []).some(
        (assessment) => assessment.type === 'intermediate',
      ),
    [subject?.assessments],
  )

  const handleSaveAssessment = useCallback(
    async (assessment: Assessment) => {
      await updateAssessments((assessments) => {
        const exists = assessments.some((a) => a.id === assessment.id)
        return exists
          ? assessments.map((a) => (a.id === assessment.id ? assessment : a))
          : [...assessments, assessment]
      })
      setFormMode('closed')
      setEditingAssessment(undefined)
    },
    [updateAssessments],
  )

  const handleDeleteAssessment = useCallback(
    async (assessmentId: string) => {
      await updateAssessments((assessments) =>
        assessments.filter((a) => a.id !== assessmentId),
      )
    },
    [updateAssessments],
  )

  const handleBonusesChange = useCallback(
    async (bonuses: Bonus[]) => {
      await updateBonuses(() => bonuses)
    },
    [updateBonuses],
  )

  const handleDeleteSubject = useCallback(async () => {
    if (!subject) return
    if (!confirm(`Удалить предмет «${subject.name}»?`)) return
    await deleteSubject(subject.id)
    navigate('/')
  }, [subject, navigate])

  if (loading) {
    return (
      <Layout>
        <LoadingSkeleton />
      </Layout>
    )
  }

  if (!subject) {
    return (
      <Layout>
        <p className="text-center text-[var(--tg-hint)]">Предмет не найден</p>
        <div className="mt-4">
          <Button variant="secondary" onClick={() => navigate('/')}>
            На главную
          </Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={subject.name}>
      <div className="space-y-6">
        {saving && (
          <p className="text-center text-xs text-[var(--tg-hint)]" aria-live="polite">
            Сохранение…
          </p>
        )}
        {saveError && (
          <p
            className="rounded-[var(--tg-radius)] border border-[var(--tg-destructive)]/30 bg-[var(--tg-destructive)]/10 px-3 py-2 text-center text-sm text-[var(--tg-destructive)]"
            role="alert"
          >
            {saveError}
          </p>
        )}

        <div aria-live="polite">
          <RatingDisplay summary={summary} />
        </div>

        {formMode === 'closed' ? (
          <>
            <AssessmentTable
              assessments={subject.assessments}
              onEdit={(assessment) => {
                setEditingAssessment(assessment)
                setFormMode('edit')
              }}
              onDelete={handleDeleteAssessment}
            />

            <Button
              variant="secondary"
              onClick={() => {
                setEditingAssessment(undefined)
                setFormMode('add')
              }}
            >
              + Добавить контрольную точку
            </Button>

            <DisciplineTypeSelector
              value={subject.disciplineType}
              onChange={(type) => void updateDisciplineType(type)}
            />

            <BonusPanel
              bonuses={subject.bonuses}
              onChange={handleBonusesChange}
            />

            <WhatIfPanel
              assessments={subject.assessments}
              bonuses={subject.bonuses}
              disciplineType={subject.disciplineType}
            />

            <Button variant="destructive" onClick={handleDeleteSubject}>
              Удалить предмет
            </Button>
          </>
        ) : (
          <Card className="p-4 sm:p-5">
            <h2 className="section-title">
              {formMode === 'edit'
                ? 'Редактирование'
                : 'Новая контрольная точка'}
            </h2>
            <div className="mt-4">
              <AssessmentForm
              initial={editingAssessment}
              hasIntermediate={hasIntermediate}
              onSave={handleSaveAssessment}
              onCancel={() => {
                setFormMode('closed')
                setEditingAssessment(undefined)
              }}
            />
            </div>
          </Card>
        )}
      </div>
    </Layout>
  )
}
