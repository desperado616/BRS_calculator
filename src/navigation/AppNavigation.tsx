import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { NewSubjectPage } from '../pages/NewSubjectPage'
import { SubjectPage } from '../pages/SubjectPage'
import { SubjectsPage } from '../pages/SubjectsPage'

type Route =
  | { name: 'home' }
  | { name: 'new' }
  | { name: 'subject'; id: string }

interface NavigationContextValue {
  goHome: () => void
  goNew: () => void
  goSubject: (id: string) => void
}

const NavigationContext = createContext<NavigationContextValue | null>(null)

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider')
  }
  return context
}

export function NavigationProvider({ children }: { children?: ReactNode }) {
  const [route, setRoute] = useState<Route>({ name: 'home' })

  const navigation = useMemo(
    () => ({
      goHome: () => setRoute({ name: 'home' }),
      goNew: () => setRoute({ name: 'new' }),
      goSubject: (id: string) => setRoute({ name: 'subject', id }),
    }),
    [],
  )

  let page: ReactNode = children
  if (!children) {
    switch (route.name) {
      case 'home':
        page = <SubjectsPage />
        break
      case 'new':
        page = <NewSubjectPage />
        break
      case 'subject':
        page = <SubjectPage subjectId={route.id} />
        break
    }
  }

  return (
    <NavigationContext.Provider value={navigation}>
      {page}
    </NavigationContext.Provider>
  )
}
