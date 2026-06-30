import { describe, expect, it } from 'vitest'
import {
  buildRatingSummary,
  calculateBonusRating,
  calculateCurrentRating,
  calculateFinalRating,
  calculateIntermediateRating,
  calculateWaivedExamRating,
  clampBonus,
  clampRating,
  eventRating,
  formatGradeInfo,
  ratingToGradeInfo,
  simulateRating,
} from '../index'
import type { Assessment, Bonus } from '../../types'

const currentAssessments: Assessment[] = [
  {
    id: '1',
    name: 'Практическая №1',
    score: 4,
    maxScore: 5,
    weight: 1,
    type: 'current',
  },
  {
    id: '2',
    name: 'Практическая №2',
    score: 5,
    maxScore: 5,
    weight: 1,
    type: 'current',
  },
  {
    id: '3',
    name: 'Лабораторная №1',
    score: 9,
    maxScore: 10,
    weight: 3,
    type: 'current',
  },
]

/** Данные из журнала Univeris — «Физическая культура и спорт» */
const physEdAssessments: Assessment[] = [
  {
    id: 'feb',
    name: 'Двигательные задания (февраль-март)',
    score: 50,
    maxScore: 80,
    weight: 22,
    type: 'current',
  },
  {
    id: 'apr',
    name: 'Двигательные задания (апрель-май)',
    score: 70,
    maxScore: 75,
    weight: 38,
    type: 'current',
  },
  {
    id: 'prac',
    name: 'Методико-практические занятия',
    score: 0,
    maxScore: 5,
    weight: 15,
    type: 'current',
  },
  {
    id: 'norm',
    name: 'Контрольные нормативы',
    score: 1,
    maxScore: 5,
    weight: 15,
    type: 'current',
  },
  {
    id: 'test',
    name: 'Теоретическое тестирование',
    score: 10,
    maxScore: 10,
    weight: 10,
    type: 'current',
  },
]

describe('eventRating', () => {
  it('calculates r_i = (b_i / b_i_max) × 100', () => {
    expect(eventRating(4, 5)).toBe(80)
    expect(eventRating(9, 10)).toBe(90)
    expect(eventRating(50, 80)).toBe(62.5)
  })

  it('clamps score above maxScore', () => {
    expect(eventRating(10, 5)).toBe(100)
  })
})

describe('calculateCurrentRating', () => {
  it('calculates weighted average R_тек', () => {
    expect(calculateCurrentRating(currentAssessments)).toBe(90)
  })

  it('includes all control points; empty score = 0', () => {
    const withEmpty: Assessment[] = [
      ...physEdAssessments.slice(0, 2),
      { ...physEdAssessments[2], score: null },
      ...physEdAssessments.slice(3),
    ]
    // null занятия = 0, как в Univeris
    expect(calculateCurrentRating(withEmpty)).toBeCloseTo(62.22, 1)
  })

  it('matches Univeris journal for physical education (62.22 %)', () => {
    expect(calculateCurrentRating(physEdAssessments)).toBeCloseTo(62.22, 1)
  })

  it('supports fractional weights below 1', () => {
    const fractional: Assessment[] = [
      {
        id: '1',
        name: 'A',
        score: 4,
        maxScore: 5,
        weight: 0.15,
        type: 'current',
      },
      {
        id: '2',
        name: 'B',
        score: 3,
        maxScore: 5,
        weight: 0.3,
        type: 'current',
      },
    ]
    // (80×0.15 + 60×0.3) / 0.45 = 66.67
    expect(calculateCurrentRating(fractional)).toBeCloseTo(66.67, 1)
  })

  it('supports decimal scores', () => {
    const decimalScores: Assessment[] = [
      {
        id: '1',
        name: 'A',
        score: 4.5,
        maxScore: 5,
        weight: 1,
        type: 'current',
      },
    ]
    expect(calculateCurrentRating(decimalScores)).toBe(90)
  })
})

describe('calculateBonusRating', () => {
  it('sums bonuses and clamps to [−15; +15]', () => {
    const bonuses: Bonus[] = [
      { id: '1', name: 'Олимпиада', value: 5 },
      { id: '2', name: 'Конференция', value: 1 },
    ]
    expect(calculateBonusRating(bonuses)).toBe(6)
    expect(clampBonus(20)).toBe(15)
    expect(clampBonus(-20)).toBe(-15)
  })
})

describe('calculateFinalRating', () => {
  it('calculates R_d = 0.6×R_тek + 0.4×R_pa + R_b', () => {
    const assessments: Assessment[] = [
      ...currentAssessments,
      {
        id: 'exam',
        name: 'Экзамен',
        score: 40,
        maxScore: 50,
        weight: 1,
        type: 'intermediate',
      },
    ]
    const bonuses: Bonus[] = [{ id: 'b1', name: 'Конференция', value: 2 }]

    expect(calculateFinalRating(assessments, bonuses)).toBe(88)
  })

  it('calculates R_pa = (b_pa / b_pa_max) × 100', () => {
    const exam: Assessment = {
      id: 'exam',
      name: 'Экзамен',
      score: 40,
      maxScore: 50,
      weight: 1,
      type: 'intermediate',
    }
    expect(calculateIntermediateRating(exam)).toBe(80)
  })

  it('applies negative R_b (штраф)', () => {
    const assessments: Assessment[] = [
      ...currentAssessments,
      {
        id: 'exam',
        name: 'Экзамен',
        score: 40,
        maxScore: 50,
        weight: 1,
        type: 'intermediate',
      },
    ]
    const penalties: Bonus[] = [{ id: 'p1', name: 'Плагиат', value: -5 }]

    expect(calculateFinalRating(assessments, penalties)).toBe(81)
  })

  it('clamps R_d to 100 when formula exceeds maximum', () => {
    const perfect: Assessment[] = [
      {
        id: '1',
        name: 'Работа',
        score: 10,
        maxScore: 10,
        weight: 1,
        type: 'current',
      },
      {
        id: 'exam',
        name: 'Экзамен',
        score: 100,
        maxScore: 100,
        weight: 1,
        type: 'intermediate',
      },
    ]
    const bonuses: Bonus[] = [{ id: 'b1', name: 'Олимпиада', value: 15 }]

    expect(calculateFinalRating(perfect, bonuses)).toBe(100)
    expect(clampRating(115)).toBe(100)
  })

  it('returns null without intermediate score', () => {
    const assessments: Assessment[] = [
      ...currentAssessments,
      {
        id: 'exam',
        name: 'Экзамен',
        score: null,
        maxScore: 50,
        weight: 1,
        type: 'intermediate',
      },
    ]
    expect(calculateFinalRating(assessments)).toBeNull()
  })
})

describe('calculateWaivedExamRating', () => {
  it('returns R_тek + R_b when R_тek ≥ 60 % and no exam', () => {
    expect(calculateWaivedExamRating(physEdAssessments)).toBeCloseTo(62.22, 1)
  })

  it('returns null when R_тek < 60 %', () => {
    const low: Assessment[] = [
      {
        id: '1',
        name: 'Работа',
        score: 1,
        maxScore: 10,
        weight: 1,
        type: 'current',
      },
    ]
    expect(calculateWaivedExamRating(low)).toBeNull()
  })
})

describe('grade scale', () => {
  it('maps exam ratings to numeric grades', () => {
    expect(formatGradeInfo(ratingToGradeInfo(85, 'exam'))).toBe('отлично (5)')
    expect(formatGradeInfo(ratingToGradeInfo(74, 'exam'))).toBe(
      'удовлетворительно (3)',
    )
    expect(formatGradeInfo(ratingToGradeInfo(59, 'exam'))).toBe(
      'неудовлетворительно (2)',
    )
  })

  it('maps credit ratings to зачтено/незачтено', () => {
    expect(formatGradeInfo(ratingToGradeInfo(62.22, 'credit'))).toBe('зачтено')
    expect(formatGradeInfo(ratingToGradeInfo(59, 'credit'))).toBe('незачтено')
  })
})

describe('simulateRating', () => {
  it('returns displayRating with waived exam rule when R_тek ≥ 60 %', () => {
    const assessments: Assessment[] = [
      {
        id: '1',
        name: 'Работа',
        score: 3,
        maxScore: 5,
        weight: 1,
        type: 'current',
      },
    ]
    expect(simulateRating(assessments, [], { '1': 4 })).toBe(80)
  })

  it('returns displayRating for multiple overridden points', () => {
    const assessments: Assessment[] = [
      {
        id: '1',
        name: 'A',
        score: 3,
        maxScore: 5,
        weight: 1,
        type: 'current',
      },
      {
        id: '2',
        name: 'B',
        score: 2,
        maxScore: 5,
        weight: 1,
        type: 'current',
      },
    ]
    expect(simulateRating(assessments, [], { '1': 4, '2': 4 })).toBe(80)
  })
})

describe('buildRatingSummary', () => {
  it('grades from R_тek before exam, not from 0.6×R_тek', () => {
    const summary = buildRatingSummary(physEdAssessments, [], 'credit')

    expect(summary.currentRating).toBeCloseTo(62.22, 1)
    expect(summary.canSkipExam).toBe(true)
    expect(summary.waivedRating).toBeCloseTo(62.22, 1)
    expect(summary.gradeLabel).toBe('зачтено')
    expect(summary.preliminaryRating).toBeCloseTo(37.33, 1)
  })

  it('grades from waived rating when penalty drops R_d below passing', () => {
    const summary = buildRatingSummary(
      physEdAssessments,
      [{ id: 'p1', name: 'Штраф', value: -5 }],
      'credit',
    )

    expect(summary.currentRating).toBeCloseTo(62.22, 1)
    expect(summary.displayRating).toBeCloseTo(57.22, 1)
    expect(summary.currentGradeLabel).toBe('зачтено')
    expect(summary.gradeLabel).toBe('незачтено')
  })

  it('shows отлично (5) for R_тek 90 % before exam', () => {
    const highCurrent: Assessment[] = [
      {
        id: '1',
        name: 'A',
        score: 4,
        maxScore: 5,
        weight: 1,
        type: 'current',
      },
      {
        id: '2',
        name: 'B',
        score: 5,
        maxScore: 5,
        weight: 1,
        type: 'current',
      },
    ]
    const summary = buildRatingSummary(highCurrent, [], 'exam')

    expect(summary.currentRating).toBe(90)
    expect(summary.gradeLabel).toBe('отлично (5)')
  })
})
