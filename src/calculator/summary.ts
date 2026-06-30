import type { Assessment, Bonus, DisciplineType, RatingSummary } from '../types'
import { calculateBonusRating } from './bonusRating'
import { formatGradeInfo, ratingToGradeInfo } from './grade'
import { calculateCurrentRating } from './currentRating'
import {
  calculateFinalRating,
  calculateIntermediateRatingFromAssessments,
  calculatePreliminaryRating,
  calculateWaivedExamRating,
  canSkipIntermediateAssessment,
} from './finalRating'

export function buildRatingSummary(
  assessments: Assessment[],
  bonuses: Bonus[] = [],
  disciplineType: DisciplineType = 'exam',
): RatingSummary {
  const currentRating = calculateCurrentRating(assessments)
  const intermediateRating =
    calculateIntermediateRatingFromAssessments(assessments)
  const bonusRating = calculateBonusRating(bonuses)
  const finalRating = calculateFinalRating(assessments, bonuses)
  const waivedRating = calculateWaivedExamRating(assessments, bonuses)
  const preliminaryRating = calculatePreliminaryRating(assessments, bonuses)
  const canSkipExam = canSkipIntermediateAssessment(assessments)

  const gradeRating = finalRating ?? currentRating
  const gradeInfo = ratingToGradeInfo(gradeRating, disciplineType)

  const displayRating =
    finalRating ?? waivedRating ?? currentRating

  return {
    currentRating,
    intermediateRating,
    bonusRating,
    finalRating,
    waivedRating,
    preliminaryRating,
    canSkipExam,
    displayRating,
    gradeInfo,
    gradeLabel: formatGradeInfo(gradeInfo),
    disciplineType,
  }
}
