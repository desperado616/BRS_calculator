import { ThemeProvider } from './hooks/useTheme'
import { useTelegram } from './hooks/useTelegram'
import { NavigationProvider } from './navigation/AppNavigation'

function AppShell() {
  useTelegram()
  return <NavigationProvider />
}

export function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  )
}
