import type { Bonus } from '../types'
import { BONUS_MAX, BONUS_MIN, clampBonus } from './constants'

/**
 * Бонус-рейтинг (п. 3.3):
 * R_b = Σ B_j, с ограничением [BONUS_MIN; BONUS_MAX]
 */
export function calculateBonusRating(bonuses: Bonus[]): number {
  const total = bonuses.reduce((sum, bonus) => sum + bonus.value, 0)
  return clampBonus(total)
}

export { BONUS_MIN, BONUS_MAX }
