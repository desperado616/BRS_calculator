import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { buildRatingSummary } from '../calculator'
import { AssessmentForm } from '../components/AssessmentForm'
import { AssessmentTable } from '../components/AssessmentTable'
import { BonusPanel } from '../components/BonusPanel'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { DisciplineTypeSelector } from '../components/DisciplineTypeSelector'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Input } from '../components/Input'
import { Layout } from '../components/Layout'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { RatingDisplay } from '../components/RatingDisplay'
import { TargetPlannerPanel } from '../components/TargetPlannerPanel'
import { WhatIfPanel } from '../components/WhatIfPanel'
import { useSubject, useSubjects } from '../hooks/useSubjects'
import { useToast } from '../hooks/useToast'
import { useTelegramBackButton } from '../hooks/useTelegram'
import { useNavigation } from '../navigation/AppNavigation'
import { confirmAction } from '../utils/confirm'
import { triggerHaptic } from '../utils/haptic'
import type { Assessment, Bonus } from '../types'

type FormMode = 'closed' | 'add' | 'edit'

interface SubjectPageProps {
  subjectId: string
}

export function SubjectPage({ subjectId }: SubjectPageProps) {
  const { goHome, goSubject } = useNavigation()
  const { showToast } = useToast()
  const { removeSubject, copySubject } = useSubjects()
  const {
    subject,
    loading,
    saving,
    saveError,
    updateAssessments,
    updateBonuses,
    updateDisciplineType,
    updateName,
  } = useSubject(subjectId)
  const [formMode, setFormMode] = useState<FormMode>('closed')
  const [editingAssessment, setEditingAssessment] = useState<
    Assessment | undefined
  >()
  const [renaming, setRenaming] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [renameError, setRenameError] = useState('')
  const [duplicating, setDuplicating] = useState(false)
  const wasSavingRef = useRef(false)

  const closeForm = useCallback(() => {
    setFormMode('closed')
    setEditingAssessment(undefined)
  }, [])

  const handleBack = useCallback(() => {
    if (formMode !== 'closed') {
      closeForm()
      return
    }
    if (renaming) {
      setRenaming(false)
      setRenameError('')
      return
    }
    goHome()
  }, [formMode, renaming, closeForm, goHome])

  useTelegramBackButton(true, handleBack)

  useEffect(() => {
    if (wasSavingRef.current && !saving && !saveError) {
      showToast('Сохранено')
      triggerHaptic('success')
    }
    wasSavingRef.current = saving
  }, [saving, saveError, showToast])

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
      const target = subject?.assessments.find((a) => a.id === assessmentId)
      if (!target) return

      const confirmed = await confirmAction(
        `Удалить «${target.name}»?`,
        { title: 'Удаление точки', confirmText: 'Удалить' },
      )
      if (!confirmed) return

      await updateAssessments((assessments) =>
        assessments.filter((a) => a.id !== assessmentId),
      )
    },
    [subject?.assessments, updateAssessments],
  )

  const handleBonusesChange = useCallback(
    async (bonuses: Bonus[]) => {
      await updateBonuses(() => bonuses)
    },
    [updateBonuses],
  )

  const handleDeleteSubject = useCallback(async () => {
    if (!subject) return
    const confirmed = await confirmAction(
      `Удалить предмет «${subject.name}»? Это действие нельзя отменить.`,
      { title: 'Удаление предмета', confirmText: 'Удалить' },
    )
    if (!confirmed) return
    await removeSubject(subject.id)
    triggerHaptic('warning')
    goHome()
  }, [subject, goHome, removeSubject])

  const handleDuplicateSubject = useCallback(async () => {
    if (!subject || duplicating) return

    setDuplicating(true)
    try {
      const copy = await copySubject(subject.id)
      triggerHaptic('success')
      showToast('Предмет скопирован')
      goSubject(copy.id)
    } catch {
      showToast('Не удалось скопировать')
    } finally {
      setDuplicating(false)
    }
  }, [subject, duplicating, goSubject, showToast, copySubject])

  const handleRename = async () => {
    if (!nameDraft.trim()) {
      setRenameError('Введите название')
      return
    }

    try {
      await updateName(nameDraft)
      setRenaming(false)
      setRenameError('')
    } catch {
      setRenameError('Не удалось сохранить название')
    }
  }

  if (loading) {
    return (
      <Layout onBack={goHome}>
        <LoadingSkeleton />
      </Layout>
    )
  }

  if (!subject) {
    return (
      <Layout title="Предмет не найден" onBack={goHome}>
        <p className="text-center text-[var(--tg-hint)]">
          Возможно, он был удалён.
        </p>
      </Layout>
    )
  }

  const backLabel =
    formMode !== 'closed'
      ? 'Отмена'
      : renaming
        ? 'Отмена'
        : 'Назад'

  return (
    <Layout title={subject.name} onBack={handleBack} backLabel={backLabel}>
      <div className="page-enter space-y-6">
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

        {renaming ? (
          <Card className="p-4">
            <div className="space-y-3">
              <Input
                label="Название предмета"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                error={renameError}
              />
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setRenaming(false)
                    setRenameError('')
                  }}
                >
                  Отмена
                </Button>
                <Button onClick={() => void handleRename()}>Сохранить</Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setNameDraft(subject.name)
                setRenaming(true)
              }}
              className="text-link min-h-0 py-1"
            >
              Переименовать предмет
            </button>
          </div>
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

            <CollapsibleSection
              title="Сколько нужно на аттестации?"
              description="Минимальный балл для цели — 3, 4, 5 или зачёт"
            >
              <TargetPlannerPanel
                assessments={subject.assessments}
                bonuses={subject.bonuses}
                disciplineType={subject.disciplineType}
                embedded
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="Что будет, если…"
              description="Симуляция баллов без сохранения в предмет"
            >
              <WhatIfPanel
                assessments={subject.assessments}
                bonuses={subject.bonuses}
                disciplineType={subject.disciplineType}
                embedded
              />
            </CollapsibleSection>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                onClick={() => void handleDuplicateSubject()}
                disabled={duplicating}
              >
                {duplicating ? 'Копирование…' : 'Дублировать'}
              </Button>
              <Button variant="destructive" onClick={() => void handleDeleteSubject()}>
                Удалить
              </Button>
            </div>
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
