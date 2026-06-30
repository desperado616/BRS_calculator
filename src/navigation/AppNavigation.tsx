import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { NewSubjectPage } from '../pages/NewSubjectPage'
import { SubjectPage } from '../pages/SubjectPage'
import { SubjectsPage } from '../pages/SubjectsPage'
import { useSubjects } from '../hooks/useSubjects'

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

function parseHash(hash: string): Route {
  const path = hash.replace(/^#\/?/, '').trim()

  if (!path || path === '/') {
    return { name: 'home' }
  }

  if (path === 'new') {
    return { name: 'new' }
  }

  const subjectMatch = path.match(/^subject\/([^/]+)$/)
  if (subjectMatch) {
    return { name: 'subject', id: decodeURIComponent(subjectMatch[1]) }
  }

  return { name: 'home' }
}

function routeToHash(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/'
    case 'new':
      return '#/new'
    case 'subject':
      return `#/subject/${encodeURIComponent(route.id)}`
  }
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider')
  }
  return context
}

export function NavigationProvider({ children }: { children?: ReactNode }) {
  const { refresh } = useSubjects()
  const [route, setRoute] = useState<Route>(() =>
    typeof window !== 'undefined'
      ? parseHash(window.location.hash)
      : { name: 'home' },
  )
  const prevRouteRef = useRef<Route>(route)

  const navigate = useCallback((next: Route) => {
    const hash = routeToHash(next)
    if (window.location.hash !== hash) {
      window.location.hash = hash
      return
    }
    setRoute(next)
  }, [])

  useEffect(() => {
    if (route.name === 'home' && prevRouteRef.current.name !== 'home') {
      void refresh()
    }
    prevRouteRef.current = route
  }, [route, refresh])

  useEffect(() => {
    const syncFromHash = () => {
      setRoute(parseHash(window.location.hash))
    }

    if (!window.location.hash) {
      window.history.replaceState(null, '', routeToHash({ name: 'home' }))
    }

    syncFromHash()
    window.addEventListener('hashchange', syncFromHash)
    return () => window.removeEventListener('hashchange', syncFromHash)
  }, [])

  const navigation = useMemo(
    () => ({
      goHome: () => navigate({ name: 'home' }),
      goNew: () => navigate({ name: 'new' }),
      goSubject: (id: string) => navigate({ name: 'subject', id }),
    }),
    [navigate],
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
