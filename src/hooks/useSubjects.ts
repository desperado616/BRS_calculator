import { useCallback, useEffect, useRef, useState } from 'react'
import type { Assessment, Bonus, DisciplineType, Subject } from '../types'
import {
  createSubject,
  deleteSubject,
  getAllSubjects,
  getSubject,
  saveSubject,
} from '../storage/db'

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const data = await getAllSubjects()
      setSubjects(data)
    } catch (error) {
      console.error('[storage]', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const addSubject = useCallback(
    async (name: string, disciplineType: DisciplineType = 'exam') => {
      const subject = await createSubject(name, disciplineType)
      await refresh()
      return subject
    },
    [refresh],
  )

  const removeSubject = useCallback(
    async (id: string) => {
      await deleteSubject(id)
      await refresh()
    },
    [refresh],
  )

  return { subjects, loading, refresh, addSubject, removeSubject }
}

export function useSubject(subjectId: string | undefined) {
  const [subject, setSubject] = useState<Subject | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const subjectRef = useRef<Subject | null>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    subjectRef.current = subject
  }, [subject])

  const refresh = useCallback(async () => {
    if (!subjectId) {
      setSubject(null)
      subjectRef.current = null
      setLoading(false)
      return
    }

    const requestId = ++requestIdRef.current
    setLoading(true)

    try {
      const data = await getSubject(subjectId)
      if (requestId !== requestIdRef.current) return

      setSubject(data ?? null)
      subjectRef.current = data ?? null
    } catch (error) {
      console.error('[storage]', error)
      if (requestId !== requestIdRef.current) return
      setSubject(null)
      subjectRef.current = null
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false)
      }
    }
  }, [subjectId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const patchSubject = useCallback(
    async (patch: (current: Subject) => Subject) => {
      const current = subjectRef.current
      if (!current) return

      const previous = current
      const updated = patch(current)
      subjectRef.current = updated
      setSubject(updated)
      setSaving(true)
      setSaveError(null)

      try {
        await saveSubject(updated)
      } catch {
        subjectRef.current = previous
        setSubject(previous)
        setSaveError('Не удалось сохранить изменения')
      } finally {
        setSaving(false)
      }
    },
    [],
  )

  const updateAssessments = useCallback(
    async (updater: (assessments: Assessment[]) => Assessment[]) => {
      await patchSubject((current) => ({
        ...current,
        assessments: updater(current.assessments),
      }))
    },
    [patchSubject],
  )

  const updateBonuses = useCallback(
    async (updater: (bonuses: Bonus[]) => Bonus[]) => {
      await patchSubject((current) => ({
        ...current,
        bonuses: updater(current.bonuses),
      }))
    },
    [patchSubject],
  )

  const updateDisciplineType = useCallback(
    async (disciplineType: DisciplineType) => {
      await patchSubject((current) => ({ ...current, disciplineType }))
    },
    [patchSubject],
  )

  return {
    subject,
    loading,
    saving,
    saveError,
    refresh,
    updateAssessments,
    updateBonuses,
    updateDisciplineType,
  }
}
