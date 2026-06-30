import type { DisciplineType } from '../types'

export type { DisciplineType }

export interface GradeInfo {
  label: string
  numericGrade?: number
  isPassing: boolean
}

/**
 * Шкала перевода рейтинга (таблица 3 Положения о БРС).
 * Округление — до ближайшего целого в большую сторону.
 */
export function ratingToGradeInfo(
  rating: number,
  disciplineType: DisciplineType = 'exam',
): GradeInfo {
  const rounded = Math.ceil(rating)

  if (disciplineType === 'credit') {
    const isPassing = rounded >= 60
    return {
      label: isPassing ? 'зачтено' : 'незачтено',
      isPassing,
    }
  }

  if (rounded >= 85) {
    return { label: 'отлично', numericGrade: 5, isPassing: true }
  }
  if (rounded >= 75) {
    return { label: 'хорошо', numericGrade: 4, isPassing: true }
  }
  if (rounded >= 60) {
    return { label: 'удовлетворительно', numericGrade: 3, isPassing: true }
  }

  return { label: 'неудовлетворительно', numericGrade: 2, isPassing: false }
}

export function formatGradeInfo(info: GradeInfo): string {
  if (info.numericGrade !== undefined) {
    return `${info.label} (${info.numericGrade})`
  }
  return info.label
}

export function ratingToGrade(rating: number): string {
  return formatGradeInfo(ratingToGradeInfo(rating, 'exam'))
}
