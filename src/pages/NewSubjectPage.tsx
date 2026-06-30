import { useCallback, useState, type FormEvent } from 'react'
import { DisciplineTypeSelector } from '../components/DisciplineTypeSelector'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Input } from '../components/Input'
import { Layout } from '../components/Layout'
import { SectionHeader } from '../components/SectionHeader'
import {
  SUBJECT_TEMPLATES,
  buildSubjectFromTemplate,
} from '../data/templates'
import { useSubjects } from '../hooks/useSubjects'
import { useTelegramBackButton } from '../hooks/useTelegram'
import { useNavigation } from '../navigation/AppNavigation'

import type { DisciplineType } from '../types'

export function NewSubjectPage() {
  const { goHome, goSubject } = useNavigation()
  const { addSubject, addSubjectFromTemplate } = useSubjects()
  const [name, setName] = useState('')
  const [disciplineType, setDisciplineType] = useState<DisciplineType>('exam')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const goBack = useCallback(() => goHome(), [goHome])
  useTelegramBackButton(true, goBack)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim() || saving) return

    setSaving(true)
    setError('')

    try {
      const subject = await addSubject(name, disciplineType)
      goSubject(subject.id)
    } catch {
      setError('Не удалось создать предмет')
      setSaving(false)
    }
  }

  const handleTemplate = async (templateId: string) => {
    const template = SUBJECT_TEMPLATES.find((item) => item.id === templateId)
    if (!template || saving) return

    setSaving(true)
    setError('')

    try {
      const subject = buildSubjectFromTemplate(
        template,
        name.trim() || template.name,
      )
      const created = await addSubjectFromTemplate(subject)
      goSubject(created.id)
    } catch {
      setError('Не удалось создать предмет из шаблона')
      setSaving(false)
    }
  }

  return (
    <Layout
      title="Новый предмет"
      subtitle="Укажите название или выберите шаблон"
      onBack={goBack}
    >
      <form onSubmit={handleSubmit} className="page-enter space-y-5">
        <Input
          label="Название предмета"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Математика (необязательно для шаблонов)"
          autoFocus
          error={error}
        />

        <DisciplineTypeSelector
          value={disciplineType}
          onChange={setDisciplineType}
        />

        <Button type="submit" disabled={!name.trim() || saving}>
          {saving ? 'Создание…' : 'Создать пустой предмет'}
        </Button>
      </form>

      <section className="mt-8 space-y-3">
        <SectionHeader
          title="Шаблоны"
          description="Готовые наборы контрольных точек — останется ввести баллы"
        />

        <ul className="space-y-2.5">
          {SUBJECT_TEMPLATES.map((template) => (
            <li key={template.id}>
              <Card className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{template.name}</p>
                    <p className="mt-1 text-xs text-[var(--tg-hint)]">
                      {template.description}
                    </p>
                    <p className="mt-1 text-xs text-[var(--tg-hint)]">
                      {template.assessments.length} точек ·{' '}
                      {template.disciplineType === 'credit' ? 'зачёт' : 'экзамен'}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => void handleTemplate(template.id)}
                    disabled={saving}
                  >
                    Выбрать
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  )
}
