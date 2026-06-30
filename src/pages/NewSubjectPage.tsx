import { useCallback, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { DisciplineTypeSelector } from '../components/DisciplineTypeSelector'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Layout } from '../components/Layout'
import { useSubjects } from '../hooks/useSubjects'
import { useTelegramBackButton } from '../hooks/useTelegram'

import type { DisciplineType } from '../types'

export function NewSubjectPage() {
  const navigate = useNavigate()
  const { addSubject } = useSubjects()
  const [name, setName] = useState('')
  const [disciplineType, setDisciplineType] = useState<DisciplineType>('exam')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const goBack = useCallback(() => navigate('/'), [navigate])
  useTelegramBackButton(true, goBack)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim() || saving) return

    setSaving(true)
    setError('')

    try {
      const subject = await addSubject(name, disciplineType)
      navigate(`/subjects/${subject.id}`)
    } catch {
      setError('Не удалось создать предмет')
      setSaving(false)
    }
  }

  return (
    <Layout title="Новый предмет" subtitle="Укажите название и тип аттестации">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Название предмета"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Математика"
          autoFocus
          required
          error={error}
        />

        <DisciplineTypeSelector
          value={disciplineType}
          onChange={setDisciplineType}
        />

        <Button type="submit" disabled={!name.trim() || saving}>
          {saving ? 'Создание…' : 'Создать'}
        </Button>
      </form>
    </Layout>
  )
}
