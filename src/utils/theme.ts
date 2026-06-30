import { safeStorageGet, safeStorageSet } from './storage'

export const THEME_STORAGE_KEY = 'brs-theme'

export type ThemeMode = 'light' | 'dark'

const THEME_COLORS: Record<ThemeMode, string> = {
  light: '#f8f9fb',
  dark: '#0a0a0c',
}

export function getStoredTheme(): ThemeMode | null {
  if (typeof window === 'undefined') return null
  const saved = safeStorageGet(THEME_STORAGE_KEY)
  if (saved === 'dark' || saved === 'light') return saved
  return null
}

export function getInitialTheme(): ThemeMode {
  const stored = getStoredTheme()
  if (stored) return stored
  if (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark'
  }
  return 'light'
}

export function updateThemeColorMeta(theme: ThemeMode) {
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', THEME_COLORS[theme])
}

/** Применяет тему. По умолчанию сохраняет выбор пользователя. */
export function applyThemeToDocument(theme: ThemeMode, persist = true) {
  document.documentElement.dataset.theme = theme
  updateThemeColorMeta(theme)
  if (persist) {
    safeStorageSet(THEME_STORAGE_KEY, theme)
  }
}

export function hasUserThemePreference(): boolean {
  return getStoredTheme() !== null
}
