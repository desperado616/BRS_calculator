/** Ограничение итогового рейтинга R_d (п. 3.3) */
export const RATING_MIN = 0
export const RATING_MAX = 100

/** Доля текущего контроля и промежуточной аттестации (п. 3.2) */
export const CURRENT_CONTROL_SHARE = 0.6
export const INTERMEDIATE_SHARE = 0.4

/**
 * Ограничение бонус-рейтинга R_b.
 * Максимум +15% — действующее положение ЮУрГУ.
 * Минимум −15% — максимальный штраф по таблице 2 (плагиат).
 */
export const BONUS_MIN = -15
export const BONUS_MAX = 15

export function clampRating(value: number): number {
  return Math.min(RATING_MAX, Math.max(RATING_MIN, value))
}

export function clampBonus(value: number): number {
  return Math.min(BONUS_MAX, Math.max(BONUS_MIN, value))
}

export function formatRating(value: number): string {
  return value.toFixed(2)
}

export function formatPercent(value: number): string {
  return `${formatRating(value)} %`
}

export function formatBonus(value: number): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${formatRating(value)} %`
}

export { formatGradeInfo, ratingToGrade, ratingToGradeInfo } from './grade'
