import type { DisciplineType } from '../types'
import { SectionHeader } from './SectionHeader'

interface DisciplineTypeSelectorProps {
  value: DisciplineType
  onChange: (value: DisciplineType) => void
}

const options: Array<{ value: DisciplineType; label: string; hint: string }> = [
  {
    value: 'exam',
    label: 'Экзамен',
    hint: 'Оценки 2–5',
  },
  {
    value: 'credit',
    label: 'Зачёт',
    hint: 'Зачтено / незачтено',
  },
]

export function DisciplineTypeSelector({
  value,
  onChange,
}: DisciplineTypeSelectorProps) {
  return (
    <section className="space-y-3">
      <SectionHeader
        title="Тип аттестации"
        description="Влияет на отображение оценки"
      />
      <div className="grid grid-cols-2 gap-2.5">
        {options.map((option) => {
          const selected = value === option.value

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-[calc(var(--tg-radius)-0.25rem)] border px-3 py-3.5 text-left transition-[border-color,background-color,transform] duration-150 active:scale-[0.98] ${
                selected
                  ? 'border-[var(--tg-accent)] bg-[var(--tg-accent-soft)] shadow-[var(--tg-shadow)]'
                  : 'border-[var(--tg-card-border)] bg-[var(--tg-secondary-bg)]'
              }`}
            >
              <span className="block text-sm font-semibold tracking-tight">
                {option.label}
              </span>
              <span className="mt-0.5 block text-xs text-[var(--tg-hint)]">
                {option.hint}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
