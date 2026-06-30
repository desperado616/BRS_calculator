import { useEffect, useState, type FormEvent } from 'react'
import type { Assessment, AssessmentType } from '../types'
import { createId } from '../utils/id'
import { formatDecimal, parseDecimalInput } from '../utils/number'
import { Button } from './Button'
import { Input } from './Input'

interface AssessmentFormProps {
  initial?: Assessment
  hasIntermediate: boolean
  onSave: (assessment: Assessment) => void
  onCancel: () => void
}

export function AssessmentForm({
  initial,
  hasIntermediate,
  onSave,
  onCancel,
}: AssessmentFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [maxScore, setMaxScore] = useState(String(initial?.maxScore ?? ''))
  const [weight, setWeight] = useState(String(initial?.weight ?? '1'))
  const [score, setScore] = useState(
    initial?.score !== null && initial?.score !== undefined
      ? String(initial.score)
      : '',
  )
  const [type, setType] = useState<AssessmentType>(
    initial?.type ?? 'current',
  )
  const [error, setError] = useState('')

  useEffect(() => {
    if (initial) {
      setName(initial.name)
      setMaxScore(String(initial.maxScore))
      setWeight(String(initial.weight))
      setScore(initial.score !== null ? String(initial.score) : '')
      setType(initial.type)
      setError('')
    }
  }, [initial])

  const isIntermediate = type === 'intermediate'

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError('')

    const parsedMax = parseDecimalInput(maxScore)
    const parsedWeight = isIntermediate ? 1 : parseDecimalInput(weight)
    const parsedScore =
      score.trim() === '' ? null : parseDecimalInput(score)

    if (!name.trim()) {
      setError('Введите название')
      return
    }

    if (parsedMax === null || parsedMax <= 0) {
      setError('Максимальный балл должен быть больше 0')
      return
    }

    if (!isIntermediate && (parsedWeight === null || parsedWeight <= 0)) {
      setError('Вес должен быть больше 0')
      return
    }

    if (score.trim() !== '') {
      if (parsedScore === null) {
        setError('Некорректный балл')
        return
      }
      if (parsedScore < 0 || parsedScore > parsedMax) {
        setError(`Балл должен быть от 0 до ${formatDecimal(parsedMax)}`)
        return
      }
    }

    onSave({
      id: initial?.id ?? createId(),
      name: name.trim(),
      maxScore: parsedMax,
      weight: isIntermediate ? 1 : (parsedWeight as number),
      score: parsedScore,
      type,
    })
  }

  const canAddIntermediate =
    isIntermediate || !hasIntermediate || initial?.type === 'intermediate'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Название"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Практическая №1"
        required
      />

      <div className={isIntermediate ? '' : 'grid grid-cols-1 gap-3 sm:grid-cols-2'}>
        <Input
          label="Максимальный балл"
          type="text"
          inputMode="decimal"
          value={maxScore}
          onChange={(e) => setMaxScore(e.target.value)}
          placeholder="5 или 80"
          required
        />
        {!isIntermediate && (
          <Input
            label="Вес"
            type="text"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="22 или 0,15"
            required
          />
        )}
      </div>

      <Input
        label="Полученный балл"
        type="text"
        inputMode="decimal"
        value={score}
        onChange={(e) => setScore(e.target.value)}
        placeholder="Не заполнено"
      />

      {canAddIntermediate && (
        <label className="card-inset flex min-h-11 cursor-pointer items-center gap-3 px-4 py-3">
          <input
            type="checkbox"
            checked={isIntermediate}
            onChange={(e) =>
              setType(e.target.checked ? 'intermediate' : 'current')
            }
            className="h-4 w-4 accent-[var(--tg-accent)]"
          />
          <span className="text-sm">
            Промежуточная аттестация (экзамен/зачёт)
          </span>
        </label>
      )}

      {error && (
        <p className="text-sm text-[var(--tg-destructive)]" role="alert">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit">Сохранить</Button>
      </div>
    </form>
  )
}
