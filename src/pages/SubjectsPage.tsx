import { useMemo, useState } from 'react'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { DataBackupPanel } from '../components/DataBackupPanel'
import { Layout } from '../components/Layout'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { SemesterOverview } from '../components/SemesterOverview'
import { SubjectList } from '../components/SubjectList'
import { SubjectSearch } from '../components/SubjectSearch'
import { useSubjects } from '../hooks/useSubjects'
import { useNavigation } from '../navigation/AppNavigation'
import { formatAppSubtitle } from '../utils/version'

export function SubjectsPage() {
  const { goNew } = useNavigation()
  const { subjects, loading, loadError, refresh } = useSubjects()
  const [query, setQuery] = useState('')

  const filteredSubjects = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return subjects
    return subjects.filter((subject) =>
      subject.name.toLowerCase().includes(trimmed),
    )
  }, [subjects, query])

  return (
    <Layout title="Мои предметы" subtitle={formatAppSubtitle()}>
      <div className="page-enter space-y-5">
        {loadError && (
          <div
            className="rounded-[var(--tg-radius)] border border-[var(--tg-destructive)]/30 bg-[var(--tg-destructive)]/10 px-3 py-3 text-center"
            role="alert"
          >
            <p className="text-sm text-[var(--tg-destructive)]">{loadError}</p>
            <Button
              variant="secondary"
              className="mt-3"
              onClick={() => void refresh()}
            >
              Повторить
            </Button>
          </div>
        )}

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {subjects.length > 0 && (
              <>
                <SemesterOverview subjects={subjects} />
                <SubjectSearch
                  value={query}
                  onChange={setQuery}
                  resultCount={filteredSubjects.length}
                />
              </>
            )}

            {subjects.length > 0 && filteredSubjects.length === 0 ? (
              <Card className="px-6 py-8 text-center">
                <p className="font-medium">Ничего не найдено</p>
                <p className="mt-1.5 text-sm text-[var(--tg-hint)]">
                  Попробуйте другое название или очистите поиск.
                </p>
                <Button
                  variant="secondary"
                  className="mt-4"
                  onClick={() => setQuery('')}
                >
                  Сбросить поиск
                </Button>
              </Card>
            ) : (
              <SubjectList subjects={filteredSubjects} />
            )}
          </>
        )}

        <Button variant="primary" onClick={goNew}>
          + Новый предмет
        </Button>

        <DataBackupPanel />
      </div>
    </Layout>
  )
}
