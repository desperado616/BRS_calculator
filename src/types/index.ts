export type AssessmentType = 'current' | 'intermediate'
export type DisciplineType = 'exam' | 'credit'

export interface Assessment {
  id: string
  name: string
  score: number | null
  maxScore: number
  weight: number
  type: AssessmentType
}

export interface Bonus {
  id: string
  name: string
  value: number
}

export interface Subject {
  id: string
  name: string
  disciplineType: DisciplineType
  assessments: Assessment[]
  bonuses: Bonus[]
}

export interface GradeInfo {
  label: string
  numericGrade?: number
  isPassing: boolean
}

export interface RatingSummary {
  currentRating: number
  intermediateRating: number | null
  bonusRating: number
  finalRating: number | null
  /** R_d при отказе от аттестации (R_тек ≥ 60 %): R_тек + R_b */
  waivedRating: number | null
  preliminaryRating: number
  canSkipExam: boolean
  /** Итоговый рейтинг для списка: R_d | R_тек+R_b | R_тек */
  displayRating: number
  /** Оценка по displayRating (список, сводка, R_d) */
  gradeInfo: GradeInfo
  gradeLabel: string
  /** Оценка только по R_тек (блок текущего контроля) */
  currentGradeInfo: GradeInfo
  currentGradeLabel: string
  disciplineType: DisciplineType
}
