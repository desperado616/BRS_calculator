import { ThemeProvider } from './hooks/useTheme'
import { ToastProvider } from './hooks/useToast'
import { SubjectsProvider } from './hooks/useSubjects'
import { useTelegram } from './hooks/useTelegram'
import { NavigationProvider } from './navigation/AppNavigation'

function AppShell() {
  useTelegram()
  return <NavigationProvider />
}

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <SubjectsProvider>
          <AppShell />
        </SubjectsProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
