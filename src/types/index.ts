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
  displayRating: number
  gradeInfo: GradeInfo
  gradeLabel: string
  disciplineType: DisciplineType
}
