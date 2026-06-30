import { describe, expect, it } from 'vitest'
import { planExamTarget } from '../reverseRating'
import type { Assessment } from '../../types'

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
  {
    id: 'exam',
    name: 'Экзамен',
    score: null,
    maxScore: 50,
    weight: 1,
    type: 'intermediate',
  },
]

const examCourse: Assessment[] = [
  {
    id: '1',
    name: 'Практическая №1',
    score: 3.25,
    maxScore: 5,
    weight: 1,
    type: 'current',
  },
  {
    id: '2',
    name: 'Практическая №2',
    score: 3.5,
    maxScore: 5,
    weight: 1,
    type: 'current',
  },
  {
    id: 'exam',
    name: 'Экзамен',
    score: null,
    maxScore: 50,
    weight: 1,
    type: 'intermediate',
  },
]

describe('planExamTarget', () => {
  it('reports already achieved target when waived rating is enough', () => {
    const withExam: Assessment[] = [
      ...currentAssessments.slice(0, 3),
      { ...currentAssessments[3], score: 40 },
    ]
    const plan = planExamTarget(withExam, [{ id: 'b', name: 'Bonus', value: 2 }], 'exam', 75)
    expect(plan.alreadyAchieved).toBe(true)
  })

  it('calculates minimum exam score for grade 4', () => {
    const plan = planExamTarget(examCourse, [], 'exam', 75)
    expect(plan.achievable).toBe(true)
    expect(plan.minScore).toBeCloseTo(43.13, 1)
  })

  it('requires intermediate assessment point when target exceeds waived rating', () => {
    const plan = planExamTarget(
      examCourse.slice(0, 2),
      [],
      'exam',
      85,
    )
    expect(plan.achievable).toBe(false)
    expect(plan.message).toContain('аттестация')
  })
})
