import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { applyThemeToDocument, getInitialTheme } from './utils/theme'
import './index.css'

declare global {
  interface Window {
    __brsShowBootError?: (message: string) => void
  }
}

function hideBootStatus() {
  const status = document.getElementById('boot-status')
  if (status) status.remove()
}

function showBootstrapError(error: unknown) {
  hideBootStatus()
  const message = error instanceof Error ? error.message : String(error)
  if (window.__brsShowBootError) {
    window.__brsShowBootError(message)
    return
  }

  const root = document.getElementById('root')
  if (!root) return
  root.innerHTML =
    '<div style="padding:24px;text-align:center;font-family:sans-serif">' +
    '<p style="font-weight:600">Не удалось запустить приложение</p>' +
    '<p style="color:#6b7280;font-size:14px">' +
    message +
    '</p></div>'
}

function mountApp() {
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    throw new Error('Root element #root not found')
  }

  applyThemeToDocument(getInitialTheme())
  hideBootStatus()

  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
}

try {
  mountApp()
} catch (error) {
  console.error(error)
  showBootstrapError(error)
}
