/** Ограничивает балл диапазоном [0; maxScore] */
export function clampScore(score: number, maxScore: number): number {
  if (maxScore <= 0) return 0
  return Math.min(maxScore, Math.max(0, score))
}
