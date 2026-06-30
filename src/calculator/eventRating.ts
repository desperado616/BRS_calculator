import type { Assessment } from '../types'
import { clampScore } from '../utils/score'

/**
 * Рейтинг по контрольному мероприятию i (п. 3.3):
 * R_i = (b_i / b_i_max) × 100
 */
export function eventRating(score: number, maxScore: number): number {
  if (maxScore <= 0) return 0
  const clamped = clampScore(score, maxScore)
  return (clamped / maxScore) * 100
}

export function weightedAverage(
  items: Array<{ rating: number; weight: number }>,
): number {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0)
  if (totalWeight === 0) return 0

  const weightedSum = items.reduce(
    (sum, item) => sum + item.rating * item.weight,
    0,
  )

  return weightedSum / totalWeight
}

export function getCurrentAssessments(assessments: Assessment[]): Assessment[] {
  return assessments.filter((assessment) => assessment.type === 'current')
}

export function getIntermediateAssessment(
  assessments: Assessment[],
): Assessment | undefined {
  return assessments.find((assessment) => assessment.type === 'intermediate')
}

export function buildEventRatings(
  assessments: Assessment[],
  scoreResolver: (assessment: Assessment) => number,
): Array<{ rating: number; weight: number }> {
  return assessments
    .filter((assessment) => assessment.weight > 0)
    .map((assessment) => ({
      rating: eventRating(scoreResolver(assessment), assessment.maxScore),
      weight: assessment.weight,
    }))
}
