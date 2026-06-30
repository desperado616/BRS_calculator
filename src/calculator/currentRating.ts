import type { Assessment } from '../types'
import {
  buildEventRatings,
  getCurrentAssessments,
  weightedAverage,
} from './eventRating'

function resolveCurrentScore(assessment: Assessment): number {
  return assessment.score ?? 0
}

/**
 * Рейтинг по текущему контролю (п. 3.3):
 * R_тек = Σ(w_i × r_i) / Σ(w_i)
 *
 * Учитываются ВСЕ контрольные точки текущего контроля.
 * Незаполненный балл = 0 (как в Univeris).
 */
export function calculateCurrentRating(assessments: Assessment[]): number {
  return calculateCurrentRatingWithScores(assessments, resolveCurrentScore)
}

/**
 * Рейтинг по текущему контролю с подстановкой баллов
 * (для min/max и симуляции).
 */
export function calculateCurrentRatingWithScores(
  assessments: Assessment[],
  scoreResolver: (assessment: Assessment) => number,
): number {
  const currentAssessments = getCurrentAssessments(assessments)
  if (currentAssessments.length === 0) return 0

  return weightedAverage(
    buildEventRatings(currentAssessments, scoreResolver),
  )
}
