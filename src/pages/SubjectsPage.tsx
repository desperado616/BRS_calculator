import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Layout } from '../components/Layout'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { SubjectList } from '../components/SubjectList'
import { useSubjects } from '../hooks/useSubjects'

export function SubjectsPage() {
  const navigate = useNavigate()
  const { subjects, loading } = useSubjects()

  return (
    <Layout title="Мои предметы" subtitle="Калькулятор БРС · ЮУрГУ">
      <div className="space-y-5">
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <SubjectList subjects={subjects} />
        )}

        <Button variant="primary" onClick={() => navigate('/subjects/new')}>
          + Новый предмет
        </Button>
      </div>
    </Layout>
  )
}
