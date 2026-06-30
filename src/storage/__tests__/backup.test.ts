import { describe, expect, it } from 'vitest'
import { assertBackupFileSize, parseBackupFile } from '../backup'
import type { Subject } from '../../types'

const sampleSubject: Subject = {
  id: '1',
  name: 'Математика',
  disciplineType: 'exam',
  assessments: [],
  bonuses: [],
}

describe('parseBackupFile', () => {
  it('parses backup wrapper format', () => {
    const result = parseBackupFile({
      version: 1,
      exportedAt: '2026-01-01T00:00:00.000Z',
      subjects: [sampleSubject],
    })
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Математика')
  })

  it('parses plain subjects array', () => {
    const result = parseBackupFile([sampleSubject])
    expect(result).toHaveLength(1)
  })

  it('rejects invalid payload', () => {
    expect(() => parseBackupFile({ subjects: [{}] })).toThrow(
      'Некорректная структура данных предмета',
    )
  })

  it('rejects oversized files', () => {
    expect(() => assertBackupFileSize(6 * 1024 * 1024)).toThrow('слишком большой')
  })
})
