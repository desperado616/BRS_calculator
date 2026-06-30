import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Assessment, Bonus, DisciplineType, Subject } from '../types'
import {
  createSubject,
  createSubjectFromData,
  deleteSubject,
  duplicateSubject,
  getAllSubjects,
  getSubject,
  saveSubject,
  updateSubjectName,
} from '../storage/db'

export interface SubjectsContextValue {
  subjects: Subject[]
  loading: boolean
  loadError: string | null
  refresh: () => Promise<void>
  addSubject: (name: string, disciplineType?: DisciplineType) => Promise<Subject>
  addSubjectFromTemplate: (subject: Subject) => Promise<Subject>
  removeSubject: (id: string) => Promise<void>
  copySubject: (id: string) => Promise<Subject>
}

const SubjectsContext = createContext<SubjectsContextValue | null>(null)

function useSubjectsState(): SubjectsContextValue {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoadError(null)
    try {
      const data = await getAllSubjects()
      setSubjects(data)
    } catch (error) {
      console.error('[storage]', error)
      setLoadError('Не удалось загрузить предметы')
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

  const addSubjectFromTemplate = useCallback(
    async (subject: Subject) => {
      const created = await createSubjectFromData(subject)
      await refresh()
      return created
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

  const copySubject = useCallback(
    async (id: string) => {
      const copy = await duplicateSubject(id)
      await refresh()
      return copy
    },
    [refresh],
  )

  return {
    subjects,
    loading,
    loadError,
    refresh,
    addSubject,
    addSubjectFromTemplate,
    removeSubject,
    copySubject,
  }
}

export function SubjectsProvider({ children }: { children: ReactNode }) {
  const value = useSubjectsState()
  return (
    <SubjectsContext.Provider value={value}>{children}</SubjectsContext.Provider>
  )
}

export function useSubjects(): SubjectsContextValue {
  const context = useContext(SubjectsContext)
  if (!context) {
    throw new Error('useSubjects must be used within SubjectsProvider')
  }
  return context
}

export function useSubject(subjectId: string | undefined) {
  const [subject, setSubject] = useState<Subject | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const subjectRef = useRef<Subject | null>(null)
  const requestIdRef = useRef(0)
  const saveChainRef = useRef<Promise<void>>(Promise.resolve())
  const savesInFlightRef = useRef(0)

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

  const enqueueSave = useCallback(
    async (updated: Subject, previous: Subject) => {
      subjectRef.current = updated
      setSubject(updated)
      savesInFlightRef.current += 1
      setSaving(true)
      setSaveError(null)

      const task = saveChainRef.current.then(async () => {
        const latest = subjectRef.current
        if (!latest) return
        await saveSubject(latest)
      })

      saveChainRef.current = task.catch(() => undefined)

      try {
        await task
      } catch {
        if (subjectRef.current === updated) {
          subjectRef.current = previous
          setSubject(previous)
          setSaveError('Не удалось сохранить изменения')
        }
        throw new Error('save failed')
      } finally {
        savesInFlightRef.current -= 1
        if (savesInFlightRef.current === 0) {
          setSaving(false)
        }
      }
    },
    [],
  )

  const patchSubject = useCallback(
    async (patch: (current: Subject) => Subject) => {
      const current = subjectRef.current
      if (!current) return

      const previous = current
      const updated = patch(current)
      await enqueueSave(updated, previous)
    },
    [enqueueSave],
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

  const updateName = useCallback(
    async (name: string) => {
      const current = subjectRef.current
      if (!current) return

      const previous = current
      const trimmed = name.trim()
      const optimistic = { ...current, name: trimmed }

      subjectRef.current = optimistic
      setSubject(optimistic)
      savesInFlightRef.current += 1
      setSaving(true)
      setSaveError(null)

      const task = saveChainRef.current.then(async () => {
        const saved = await updateSubjectName(current.id, trimmed)
        subjectRef.current = saved
        setSubject(saved)
      })

      saveChainRef.current = task.catch(() => undefined)

      try {
        await task
      } catch {
        subjectRef.current = previous
        setSubject(previous)
        setSaveError('Не удалось сохранить название')
        throw new Error('rename failed')
      } finally {
        savesInFlightRef.current -= 1
        if (savesInFlightRef.current === 0) {
          setSaving(false)
        }
      }
    },
    [],
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
    updateName,
  }
}
