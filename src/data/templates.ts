import type { Assessment, DisciplineType, Subject } from '../types'
import { createId } from '../utils/id'

export interface SubjectTemplate {
  id: string
  name: string
  disciplineType: DisciplineType
  description: string
  assessments: Omit<Assessment, 'id'>[]
}

export const SUBJECT_TEMPLATES: SubjectTemplate[] = [
  {
    id: 'exam-standard',
    name: 'Экзамен (типовой)',
    disciplineType: 'exam',
    description: '2 практики, лабораторная и экзамен',
    assessments: [
      {
        name: 'Практическая №1',
        score: null,
        maxScore: 5,
        weight: 1,
        type: 'current',
      },
      {
        name: 'Практическая №2',
        score: null,
        maxScore: 5,
        weight: 1,
        type: 'current',
      },
      {
        name: 'Лабораторная №1',
        score: null,
        maxScore: 10,
        weight: 3,
        type: 'current',
      },
      {
        name: 'Экзамен',
        score: null,
        maxScore: 50,
        weight: 1,
        type: 'intermediate',
      },
    ],
  },
  {
    id: 'phys-ed',
    name: 'Физическая культура',
    disciplineType: 'credit',
    description: 'Пример из README — зачёт без аттестации',
    assessments: [
      {
        name: 'Двигательные задания (февраль–март)',
        score: null,
        maxScore: 80,
        weight: 22,
        type: 'current',
      },
      {
        name: 'Двигательные задания (апрель–май)',
        score: null,
        maxScore: 75,
        weight: 38,
        type: 'current',
      },
      {
        name: 'Методико-практические занятия',
        score: null,
        maxScore: 5,
        weight: 15,
        type: 'current',
      },
      {
        name: 'Контрольные нормативы',
        score: null,
        maxScore: 5,
        weight: 15,
        type: 'current',
      },
      {
        name: 'Теоретическое тестирование',
        score: null,
        maxScore: 10,
        weight: 10,
        type: 'current',
      },
    ],
  },
  {
    id: 'credit-lab',
    name: 'Лабораторный курс (зачёт)',
    disciplineType: 'credit',
    description: 'Несколько лабораторных и зачёт',
    assessments: [
      {
        name: 'Лабораторная №1',
        score: null,
        maxScore: 10,
        weight: 1,
        type: 'current',
      },
      {
        name: 'Лабораторная №2',
        score: null,
        maxScore: 10,
        weight: 1,
        type: 'current',
      },
      {
        name: 'Лабораторная №3',
        score: null,
        maxScore: 10,
        weight: 1,
        type: 'current',
      },
      {
        name: 'Зачёт',
        score: null,
        maxScore: 30,
        weight: 1,
        type: 'intermediate',
      },
    ],
  },
]

export function buildSubjectFromTemplate(
  template: SubjectTemplate,
  customName?: string,
): Subject {
  return {
    id: createId(),
    name: customName?.trim() || template.name,
    disciplineType: template.disciplineType,
    assessments: template.assessments.map((assessment) => ({
      ...assessment,
      id: createId(),
    })),
    bonuses: [],
  }
}
