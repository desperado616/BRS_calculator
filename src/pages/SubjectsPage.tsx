import { Button } from '../components/Button'
import { Layout } from '../components/Layout'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { SubjectList } from '../components/SubjectList'
import { useSubjects } from '../hooks/useSubjects'
import { useNavigation } from '../navigation/AppNavigation'

export function SubjectsPage() {
  const { goNew } = useNavigation()
  const { subjects, loading } = useSubjects()

  return (
    <Layout title="Мои предметы" subtitle="Калькулятор БРС · ЮУрГУ · v1.0.3">
      <div className="space-y-5">
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <SubjectList subjects={subjects} />
        )}

        <Button variant="primary" onClick={goNew}>
          + Новый предмет
        </Button>
      </div>
    </Layout>
  )
}
