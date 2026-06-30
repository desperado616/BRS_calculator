import type { ReactNode } from 'react'
import { Component } from 'react'
import { Button } from './Button'
import { Card } from './Card'

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

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen min-h-[100dvh] items-center justify-center bg-[var(--tg-bg)] p-6">
          <Card className="max-w-sm px-6 py-8 text-center">
            <h1 className="text-lg font-semibold tracking-tight">
              Не удалось загрузить приложение
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[var(--tg-hint)]">
              {this.state.error.message}
            </p>
            <div className="mt-6">
              <Button onClick={() => window.location.reload()}>
                Обновить
              </Button>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
