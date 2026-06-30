import type { Assessment, Bonus } from '../types'
import { clampScore } from '../utils/score'
import { calculateDisciplineRating } from './finalRating'
import { calculateCurrentRatingWithScores } from './currentRating'

export type ScoreOverrides = Record<string, number>

function resolveScore(
  assessment: Assessment,
  overrides: ScoreOverrides,
): number {
  if (assessment.id in overrides) {
    return clampScore(overrides[assessment.id], assessment.maxScore)
  }
  return assessment.score ?? 0
}

/**
 * Режим «Что будет если…» — симуляция без сохранения.
 * Переопределяются только переданные контрольные точки.
 */
export function simulateRating(
  assessments: Assessment[],
  bonuses: Bonus[],
  overrides: ScoreOverrides = {},
): number {
  return calculateDisciplineRating(
    assessments,
    (assessment) => resolveScore(assessment, overrides),
    bonuses,
  )
}

export function simulateCurrentRating(
  assessments: Assessment[],
  overrides: ScoreOverrides = {},
): number {
  return calculateCurrentRatingWithScores(
    assessments,
    (assessment) => resolveScore(assessment, overrides),
  )
}
