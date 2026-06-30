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

  const displayRating =
    finalRating ?? waivedRating ?? currentRating

  const gradeInfo = ratingToGradeInfo(displayRating, disciplineType)
  const currentGradeInfo = ratingToGradeInfo(currentRating, disciplineType)

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
    currentGradeInfo,
    currentGradeLabel: formatGradeInfo(currentGradeInfo),
    disciplineType,
  }
}
