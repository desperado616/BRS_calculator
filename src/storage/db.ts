import Dexie, { type EntityTable } from 'dexie'
import type { Assessment, DisciplineType, Subject } from '../types'
import { createId } from '../utils/id'

class BrsDatabase extends Dexie {
  subjects!: EntityTable<Subject, 'id'>

  constructor() {
    super('brs-calculator')

    this.version(1).stores({
      subjects: 'id, name',
    })

    this.version(2)
      .stores({
        subjects: 'id, name',
      })
      .upgrade((tx) =>
        tx.table('subjects').toCollection().modify((subject: Subject) => {
          if (!subject.bonuses) subject.bonuses = []
          if (!subject.assessments) subject.assessments = []
        }),
      )

    this.version(3)
      .stores({
        subjects: 'id, name',
      })
      .upgrade((tx) =>
        tx.table('subjects').toCollection().modify((subject: Subject) => {
          if (!subject.disciplineType) {
            subject.disciplineType = 'exam'
          }
        }),
      )
  }
}

export const db = new BrsDatabase()

export async function getAllSubjects(): Promise<Subject[]> {
  const subjects = await db.subjects.orderBy('name').toArray()
  return subjects.map(normalizeSubject)
}

export async function getSubject(id: string): Promise<Subject | undefined> {
  const subject = await db.subjects.get(id)
  return subject ? normalizeSubject(subject) : undefined
}

export async function saveSubject(subject: Subject): Promise<void> {
  await db.subjects.put(normalizeSubject(subject))
}

export async function deleteSubject(id: string): Promise<void> {
  await db.subjects.delete(id)
}

export async function createSubject(
  name: string,
  disciplineType: DisciplineType = 'exam',
): Promise<Subject> {
  const trimmed = name.trim()
  if (!trimmed) {
    throw new Error('Название предмета не может быть пустым')
  }

  const subject: Subject = {
    id: createId(),
    name: trimmed,
    disciplineType,
    assessments: [],
    bonuses: [],
  }

  await db.subjects.add(subject)
  return subject
}

function sanitizeAssessments(assessments: Assessment[]): Assessment[] {
  let intermediateFound = false

  return assessments.map((assessment) => {
    if (assessment.type !== 'intermediate') {
      return assessment
    }

    if (intermediateFound) {
      return { ...assessment, type: 'current' as const }
    }

    intermediateFound = true
    return assessment
  })
}

function normalizeSubject(subject: Subject): Subject {
  return {
    ...subject,
    name: subject.name?.trim() || 'Без названия',
    disciplineType: subject.disciplineType ?? 'exam',
    assessments: sanitizeAssessments(subject.assessments ?? []),
    bonuses: subject.bonuses ?? [],
  }
}
