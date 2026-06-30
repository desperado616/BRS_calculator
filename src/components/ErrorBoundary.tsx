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

  private handleRetry = () => {
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      return (
        <div className="error-boundary flex min-h-screen items-center justify-center bg-[var(--tg-bg)] p-6 text-[var(--tg-text)]">
          <div className="max-w-xs text-center">
            <h1 className="mb-3 text-lg font-semibold">
              Не удалось загрузить приложение
            </h1>
            <p className="mb-5 break-words text-sm leading-relaxed text-[var(--tg-hint)]">
              {this.state.error.message}
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={this.handleRetry}
                className="min-h-11 rounded-xl bg-[var(--tg-button)] px-5 py-3 text-[0.9375rem] font-medium text-[var(--tg-button-text)]"
              >
                Попробовать снова
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="min-h-11 rounded-xl border border-[var(--tg-separator)] px-5 py-3 text-[0.9375rem] font-medium"
              >
                Обновить страницу
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
