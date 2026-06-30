import type { Assessment, Bonus } from '../types'
import { calculateBonusRating } from './bonusRating'
import {
  CURRENT_CONTROL_SHARE,
  INTERMEDIATE_SHARE,
  clampRating,
} from './constants'
import { calculateCurrentRating } from './currentRating'
import { calculateCurrentRatingWithScores } from './currentRating'
import { eventRating, getIntermediateAssessment } from './eventRating'

export function isIntermediateFilled(assessments: Assessment[]): boolean {
  const intermediate = getIntermediateAssessment(assessments)
  return intermediate !== undefined && intermediate.score !== null
}

/**
 * Рейтинг по промежуточной аттестации (п. 3.3):
 * R_pa = (b_pa / b_pa_max) × 100
 */
export function calculateIntermediateRating(
  assessment: Assessment,
): number {
  if (assessment.score === null) return 0
  return eventRating(assessment.score, assessment.maxScore)
}

export interface DisciplineRatingOptions {
  defaultIntermediateRating?: number
}

/**
 * Итоговый рейтинг по дисциплине (п. 3.3):
 * R_d = 0.6 × R_тек + 0.4 × R_pa + R_b
 */
export function calculateDisciplineRating(
  assessments: Assessment[],
  scoreResolver: (assessment: Assessment) => number,
  bonuses: Bonus[],
  options: DisciplineRatingOptions = {},
): number {
  const bonus = calculateBonusRating(bonuses)
  const currentRating = calculateCurrentRatingWithScores(
    assessments,
    scoreResolver,
  )

  const intermediate = getIntermediateAssessment(assessments)
  let intermediateRating = options.defaultIntermediateRating ?? 0

  if (intermediate) {
    intermediateRating = eventRating(
      scoreResolver(intermediate),
      intermediate.maxScore,
    )
  }

  return clampRating(
    CURRENT_CONTROL_SHARE * currentRating +
      INTERMEDIATE_SHARE * intermediateRating +
      bonus,
  )
}

/**
 * Итоговый R_d, когда аттестация сдана.
 */
export function calculateFinalRating(
  assessments: Assessment[],
  bonuses: Bonus[] = [],
): number | null {
  if (!isIntermediateFilled(assessments)) return null

  const bonus = calculateBonusRating(bonuses)
  const currentRating = calculateCurrentRating(assessments)
  const intermediate = getIntermediateAssessment(assessments)!
  const intermediateRating = calculateIntermediateRating(intermediate)

  return clampRating(
    CURRENT_CONTROL_SHARE * currentRating +
      INTERMEDIATE_SHARE * intermediateRating +
      bonus,
  )
}

/**
 * Правило п. 3.3: при R_тек ≥ 60 % можно не сдавать аттестацию,
 * тогда R_pa := R_тек и R_d = R_тек + R_b.
 */
export function calculateWaivedExamRating(
  assessments: Assessment[],
  bonuses: Bonus[] = [],
): number | null {
  const currentRating = calculateCurrentRating(assessments)
  if (currentRating < 60 - 0.001) return null
  if (isIntermediateFilled(assessments)) return null

  const bonus = calculateBonusRating(bonuses)
  return clampRating(currentRating + bonus)
}

/** Минимальный R_d до аттестации (R_pa = 0): 0.6 × R_тек + R_b */
export function calculatePreliminaryRating(
  assessments: Assessment[],
  bonuses: Bonus[] = [],
): number {
  const bonus = calculateBonusRating(bonuses)
  const currentRating = calculateCurrentRating(assessments)

  return clampRating(CURRENT_CONTROL_SHARE * currentRating + bonus)
}

export function calculateIntermediateRatingFromAssessments(
  assessments: Assessment[],
): number | null {
  const intermediate = getIntermediateAssessment(assessments)
  if (!intermediate || intermediate.score === null) return null
  return calculateIntermediateRating(intermediate)
}

export function canSkipIntermediateAssessment(
  assessments: Assessment[],
): boolean {
  return (
    !isIntermediateFilled(assessments) &&
    calculateCurrentRating(assessments) >= 60 - 0.001
  )
}
