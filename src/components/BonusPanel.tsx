import { useMemo, useState } from 'react'
import { calculateBonusRating, formatBonus } from '../calculator'
import type { Bonus } from '../types'
import { createId } from '../utils/id'
import { parseDecimalInput } from '../utils/number'
import { Button } from './Button'
import { Card } from './Card'
import { Input } from './Input'
import { SectionHeader } from './SectionHeader'

interface BonusPanelProps {
  bonuses: Bonus[]
  onChange: (bonuses: Bonus[]) => void
}

export function BonusPanel({ bonuses, onChange }: BonusPanelProps) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  const clampedTotal = useMemo(
    () => calculateBonusRating(bonuses),
    [bonuses],
  )

  const rawTotal = useMemo(
    () => bonuses.reduce((sum, bonus) => sum + bonus.value, 0),
    [bonuses],
  )

  const handleAdd = () => {
    const parsed = parseDecimalInput(value)
    if (!name.trim()) {
      setError('Введите название показателя')
      return
    }
    if (parsed === null) {
      setError('Введите числовое значение')
      return
    }

    onChange([
      ...bonuses,
      { id: createId(), name: name.trim(), value: parsed },
    ])
    setName('')
    setValue('')
    setError('')
    setAdding(false)
  }

  const handleDelete = (id: string) => {
    onChange(bonuses.filter((bonus) => bonus.id !== id))
  }

  return (
    <section className="space-y-3">
      <SectionHeader
        title="Бонус-рейтинг (R_b)"
        action={
          !adding ? (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="text-link shrink-0 min-h-0 py-1"
            >
              + Добавить
            </button>
          ) : undefined
        }
      />

      <Card className="px-4 py-3.5">
        <p className="stat-label">Итого</p>
        <p className="stat-value mt-1 text-xl">{formatBonus(clampedTotal)}</p>
        {Math.abs(rawTotal - clampedTotal) > 0.001 && (
          <p className="mt-1.5 text-xs leading-relaxed text-[var(--tg-hint)]">
            Сумма {formatBonus(rawTotal)} → ограничено до{' '}
            {formatBonus(clampedTotal)}
          </p>
        )}
      </Card>

      {bonuses.length > 0 ? (
        <Card className="overflow-hidden p-0">
          <ul className="divide-y divide-[var(--tg-separator)]">
            {bonuses.map((bonus) => (
              <li
                key={bonus.id}
                className="flex items-center justify-between gap-3 px-4 py-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{bonus.name}</p>
                  <p
                    className={`mt-0.5 text-sm font-semibold tabular-nums ${
                      bonus.value > 0
                        ? 'text-[var(--tg-success)]'
                        : bonus.value < 0
                          ? 'text-[var(--tg-destructive)]'
                          : 'text-[var(--tg-hint)]'
                    }`}
                  >
                    {bonus.value > 0 ? '+' : ''}
                    {bonus.value} %
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(bonus.id)}
                  className="shrink-0 text-sm font-medium text-[var(--tg-destructive)]"
                  aria-label={`Удалить ${bonus.name}`}
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        !adding && (
          <Card className="px-4 py-5 text-center text-sm text-[var(--tg-hint)]">
            Нет бонусов или штрафов
          </Card>
        )
      )}

      {adding && (
        <Card className="space-y-3 p-4">
          <Input
            label="Показатель"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Олимпиада, конференция…"
          />
          <Input
            label="Бонус, %"
            type="text"
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="+5 или −1,5"
            error={error}
          />
          <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
            <Button variant="secondary" onClick={() => setAdding(false)}>
              Отмена
            </Button>
            <Button onClick={handleAdd}>Сохранить</Button>
          </div>
        </Card>
      )}
    </section>
  )
}
