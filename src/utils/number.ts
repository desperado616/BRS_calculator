/** Нормализует ввод: «0,15» → «0.15» */
export function normalizeDecimalInput(value: string): string {
  return value.trim().replace(',', '.')
}

/** Парсит десятичное число из строки (точка или запятая). */
export function parseDecimalInput(value: string): number | null {
  const normalized = normalizeDecimalInput(value)
  if (normalized === '' || normalized === '-' || normalized === '+') {
    return null
  }
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

/** Форматирует число без лишних нулей (0.15 → «0.15», 22 → «22»). */
export function formatDecimal(value: number, maxFractionDigits = 4): string {
  const rounded = Number(value.toFixed(maxFractionDigits))
  return rounded.toLocaleString('ru-RU', {
    maximumFractionDigits: maxFractionDigits,
    useGrouping: false,
  })
}
