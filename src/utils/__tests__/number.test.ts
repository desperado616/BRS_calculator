import { describe, expect, it } from 'vitest'
import { formatDecimal, parseDecimalInput } from '../number'

describe('parseDecimalInput', () => {
  it('parses dot and comma decimals', () => {
    expect(parseDecimalInput('0.15')).toBe(0.15)
    expect(parseDecimalInput('0,15')).toBe(0.15)
    expect(parseDecimalInput('0,3')).toBe(0.3)
    expect(parseDecimalInput('  4,5  ')).toBe(4.5)
  })

  it('returns null for empty or invalid input', () => {
    expect(parseDecimalInput('')).toBeNull()
    expect(parseDecimalInput('abc')).toBeNull()
  })
})

describe('formatDecimal', () => {
  it('formats without trailing zeros', () => {
    expect(formatDecimal(0.15)).toBe('0,15')
    expect(formatDecimal(0.3)).toBe('0,3')
    expect(formatDecimal(22)).toBe('22')
  })
})
