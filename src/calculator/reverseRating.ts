import type { Assessment, Bonus, DisciplineType } from '../types'
import { calculateBonusRating } from './bonusRating'
import { BONUS_MAX, BONUS_MIN, CURRENT_CONTROL_SHARE, INTERMEDIATE_SHARE } from './constants'
import { calculateCurrentRating } from './currentRating'
import { getIntermediateAssessment } from './eventRating'
import {
  calculateFinalRating,
  calculateWaivedExamRating,
  canSkipIntermediateAssessment,
} from './finalRating'
import { ratingToGradeInfo } from './grade'

export interface TargetPlanResult {
  achievable: boolean
  /** Минимальный балл на аттестации (округление вверх до 0.01) */
  minScore: number | null
  /** Целевой R_d */
  targetRating: number
  /** R_d при minScore */
  resultingRating: number | null
  /** Уже достигнуто без аттестации */
  alreadyAchieved: boolean
  /** Можно не сдавать аттестацию */
  canSkipExam: boolean
  message: string
}

const EXAM_TARGETS: Array<{ label: string; minRating: number }> = [
  { label: 'отлично (5)', minRating: 85 },
  { label: 'хорошо (4)', minRating: 75 },
  { label: 'удовлетворительно (3)', minRating: 60 },
  { label: 'зачтено / сдать', minRating: 60 },
]

export function getTargetOptions(
  disciplineType: DisciplineType,
): Array<{ label: string; minRating: number }> {
  if (disciplineType === 'credit') {
    return [{ label: 'зачтено', minRating: 60 }]
  }
  return EXAM_TARGETS.filter((target) => target.label !== 'зачтено / сдать')
}

export function planExamTarget(
  assessments: Assessment[],
  bonuses: Bonus[],
  disciplineType: DisciplineType,
  targetMinRating: number,
): TargetPlanResult {
  const currentRating = calculateCurrentRating(assessments)
  const bonusRating = calculateBonusRating(bonuses)
  const intermediate = getIntermediateAssessment(assessments)
  const canSkip = canSkipIntermediateAssessment(assessments)
  const waivedRating = calculateWaivedExamRating(assessments, bonuses)
  const finalRating = calculateFinalRating(assessments, bonuses)

  const displayRating =
    finalRating ?? waivedRating ?? currentRating

  if (displayRating >= targetMinRating - 0.001) {
    return {
      achievable: true,
      minScore: 0,
      targetRating: targetMinRating,
      resultingRating: displayRating,
      alreadyAchieved: true,
      canSkipExam: canSkip,
      message: 'Цель уже достигнута с текущими баллами.',
    }
  }

  if (canSkip && waivedRating !== null && waivedRating >= targetMinRating - 0.001) {
    return {
      achievable: true,
      minScore: null,
      targetRating: targetMinRating,
      resultingRating: waivedRating,
      alreadyAchieved: false,
      canSkipExam: true,
      message: 'Можно не сдавать аттестацию — цель достижима без экзамена.',
    }
  }

  if (!intermediate) {
    return {
      achievable: false,
      minScore: null,
      targetRating: targetMinRating,
      resultingRating: null,
      alreadyAchieved: false,
      canSkipExam: canSkip,
      message: 'Добавьте контрольную точку «Промежуточная аттестация».',
    }
  }

  if (intermediate.maxScore <= 0) {
    return {
      achievable: false,
      minScore: null,
      targetRating: targetMinRating,
      resultingRating: null,
      alreadyAchieved: false,
      canSkipExam: false,
      message: 'Укажите максимальный балл аттестации.',
    }
  }

  const requiredRd = targetMinRating
  const requiredPa =
    (requiredRd - CURRENT_CONTROL_SHARE * currentRating - bonusRating) /
    INTERMEDIATE_SHARE

  if (requiredPa > 100 + 0.001) {
    return {
      achievable: false,
      minScore: null,
      targetRating: targetMinRating,
      resultingRating: null,
      alreadyAchieved: false,
      canSkipExam: false,
      message: 'Цель недостижима даже при 100 % на аттестации.',
    }
  }

  const rawScore = (Math.max(0, requiredPa) / 100) * intermediate.maxScore
  const minScore = Math.ceil(rawScore * 100 - 0.001) / 100
  const clampedScore = Math.min(intermediate.maxScore, Math.max(0, minScore))

  const simulated = assessments.map((assessment) =>
    assessment.id === intermediate.id
      ? { ...assessment, score: clampedScore }
      : assessment,
  )
  const resultingRating = calculateFinalRating(simulated, bonuses)

  const gradeOk =
    resultingRating !== null &&
    ratingToGradeInfo(resultingRating, disciplineType).isPassing &&
    resultingRating >= targetMinRating - 0.001

  if (clampedScore > intermediate.maxScore + 0.001 || resultingRating === null) {
    return {
      achievable: false,
      minScore: null,
      targetRating: targetMinRating,
      resultingRating: null,
      alreadyAchieved: false,
      canSkipExam: false,
      message: 'Не удалось подобрать балл для этой цели.',
    }
  }

  return {
    achievable: gradeOk,
    minScore: clampedScore,
    targetRating: targetMinRating,
    resultingRating,
    alreadyAchieved: false,
    canSkipExam: false,
    message:
      clampedScore <= 0
        ? 'Достаточно сдать аттестацию на 0 баллов.'
        : `Нужно не менее ${formatScore(clampedScore)} из ${formatScore(intermediate.maxScore)} на аттестации.`,
  }
}

function formatScore(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace('.', ',')
}

export function validateBonusInput(value: number): string | null {
  if (value < BONUS_MIN || value > BONUS_MAX) {
    return `Бонус от ${BONUS_MIN} до +${BONUS_MAX} %`
  }
  return null
}
