import type { Assessment, Bonus } from '../types'
import { clampScore } from '../utils/score'
import { calculateCurrentRatingWithScores } from './currentRating'
import { buildRatingSummary } from './summary'

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

function buildSimulatedAssessments(
  assessments: Assessment[],
  overrides: ScoreOverrides,
): Assessment[] {
  return assessments.map((assessment) => {
    if (!(assessment.id in overrides)) return assessment
    return {
      ...assessment,
      score: clampScore(overrides[assessment.id], assessment.maxScore),
    }
  })
}

/**
 * Режим «Что будет если…» — симуляция без сохранения.
 * Возвращает displayRating (как в UI), с учётом отказа от аттестации.
 */
export function simulateRating(
  assessments: Assessment[],
  bonuses: Bonus[],
  overrides: ScoreOverrides = {},
  disciplineType: 'exam' | 'credit' = 'exam',
): number {
  const simulated = buildSimulatedAssessments(assessments, overrides)
  return buildRatingSummary(simulated, bonuses, disciplineType).displayRating
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
