import type { ReactNode } from 'react'
import { Component } from 'react'
import { getTelegramWebApp } from '../utils/telegram'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error) {
    try {
      getTelegramWebApp()?.showAlert?.(error.message)
    } catch {
      // ignore
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '100vh',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8f9fb',
            color: '#0f1419',
            fontFamily:
              '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
          }}
        >
          <div style={{ maxWidth: '320px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 12px' }}>
              Не удалось загрузить приложение
            </h1>
            <p
              style={{
                fontSize: '14px',
                lineHeight: 1.5,
                color: '#6b7280',
                margin: '0 0 20px',
                wordBreak: 'break-word',
              }}
            >
              {this.state.error.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                minHeight: '44px',
                padding: '12px 20px',
                border: 'none',
                borderRadius: '12px',
                background: '#2563eb',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 500,
              }}
            >
              Обновить
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
