import type { WebApp } from '@twa-dev/types'

export function getTelegramWebApp(): WebApp | null {
  if (typeof window === 'undefined') return null
  return window.Telegram?.WebApp ?? null
}

export function isTelegramEnvironment(): boolean {
  return getTelegramWebApp() !== null
}
