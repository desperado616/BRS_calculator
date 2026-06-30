import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { applyThemeToDocument, getInitialTheme } from './utils/theme'
import './index.css'

function showBootstrapError(error: unknown) {
  const root = document.getElementById('root')
  if (!root) return

  const message = error instanceof Error ? error.message : String(error)

  root.innerHTML = `
    <div style="min-height:100vh;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8f9fb;color:#0f1419;display:flex;align-items:center;justify-content:center;">
      <div style="max-width:320px;text-align:center;">
        <p style="font-size:18px;font-weight:600;margin:0 0 12px;">Не удалось запустить приложение</p>
        <p style="font-size:14px;line-height:1.5;color:#6b7280;margin:0 0 20px;">${message}</p>
        <button type="button" onclick="location.reload()" style="min-height:44px;padding:12px 20px;border:none;border-radius:12px;background:#2563eb;color:#fff;font-size:15px;font-weight:500;">
          Обновить
        </button>
      </div>
    </div>
  `
}

function mountApp() {
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    throw new Error('Root element #root not found')
  }

  applyThemeToDocument(getInitialTheme())

  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
}

window.addEventListener('error', (event) => {
  console.error('[bootstrap]', event.error ?? event.message)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('[bootstrap]', event.reason)
})

try {
  mountApp()
} catch (error) {
  console.error(error)
  showBootstrapError(error)
}
