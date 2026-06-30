import { HashRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './hooks/useTheme'
import { useTelegram } from './hooks/useTelegram'
import { NewSubjectPage } from './pages/NewSubjectPage'
import { SubjectPage } from './pages/SubjectPage'
import { SubjectsPage } from './pages/SubjectsPage'

function AppRoutes() {
  useTelegram()

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<SubjectsPage />} />
        <Route path="/subjects/new" element={<NewSubjectPage />} />
        <Route path="/subjects/:id" element={<SubjectPage />} />
      </Routes>
    </HashRouter>
  )
}

export function App() {
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  )
}
