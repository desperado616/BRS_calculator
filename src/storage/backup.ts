import type { Assessment, Bonus, Subject } from '../types'
import { createId } from '../utils/id'
import { createSubjectFromData, getAllSubjects, saveSubject, db } from './db'

const BACKUP_VERSION = 1
const MAX_BACKUP_FILE_BYTES = 5 * 1024 * 1024

export interface BackupFile {
  version: number
  exportedAt: string
  subjects: Subject[]
}

export async function exportAllSubjects(): Promise<BackupFile> {
  const subjects = await getAllSubjects()
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    subjects,
  }
}

export function downloadBackup(data: BackupFile): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `brs-backup-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

function isValidAssessment(value: unknown): value is Assessment {
  if (!value || typeof value !== 'object') return false
  const assessment = value as Record<string, unknown>
  const type = assessment.type
  const weight = assessment.weight

  return (
    typeof assessment.id === 'string' &&
    typeof assessment.name === 'string' &&
    (assessment.score === null || typeof assessment.score === 'number') &&
    typeof assessment.maxScore === 'number' &&
    assessment.maxScore > 0 &&
    typeof weight === 'number' &&
    weight > 0 &&
    (type === 'current' || type === 'intermediate')
  )
}

function isValidBonus(value: unknown): value is Bonus {
  if (!value || typeof value !== 'object') return false
  const bonus = value as Record<string, unknown>
  return (
    typeof bonus.id === 'string' &&
    typeof bonus.name === 'string' &&
    typeof bonus.value === 'number'
  )
}

function isValidSubject(value: unknown): value is Subject {
  if (!value || typeof value !== 'object') return false
  const subject = value as Record<string, unknown>

  if (
    typeof subject.id !== 'string' ||
    typeof subject.name !== 'string' ||
    (subject.disciplineType !== 'exam' && subject.disciplineType !== 'credit') ||
    !Array.isArray(subject.assessments) ||
    !Array.isArray(subject.bonuses)
  ) {
    return false
  }

  return (
    subject.assessments.every(isValidAssessment) &&
    subject.bonuses.every(isValidBonus)
  )
}

export function parseBackupFile(json: unknown): Subject[] {
  if (!json || typeof json !== 'object') {
    throw new Error('Некорректный файл резервной копии')
  }

  const data = json as Record<string, unknown>
  let subjects: unknown[]

  if (Array.isArray(data.subjects)) {
    subjects = data.subjects
  } else if (Array.isArray(json)) {
    subjects = json
  } else {
    throw new Error('Файл не содержит предметов')
  }

  if (subjects.length === 0) {
    throw new Error('Файл не содержит предметов')
  }

  const validated: Subject[] = []
  for (const subject of subjects) {
    if (!isValidSubject(subject)) {
      throw new Error('Некорректная структура данных предмета')
    }
    validated.push(subject)
  }

  return validated
}

export function assertBackupFileSize(bytes: number): void {
  if (bytes > MAX_BACKUP_FILE_BYTES) {
    throw new Error('Файл слишком большой (максимум 5 МБ)')
  }
}

export async function importSubjects(
  subjects: Subject[],
  mode: 'merge' | 'replace',
): Promise<number> {
  if (mode === 'replace') {
    await db.subjects.clear()
  }

  for (const subject of subjects) {
    if (mode === 'merge') {
      await createSubjectFromData({
        ...subject,
        id: createId(),
        assessments: subject.assessments.map((assessment) => ({
          ...assessment,
          id: createId(),
        })),
        bonuses: subject.bonuses.map((bonus) => ({
          ...bonus,
          id: createId(),
        })),
      })
    } else {
      await saveSubject(subject)
    }
  }

  return subjects.length
}
