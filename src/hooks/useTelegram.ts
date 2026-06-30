import { useEffect, useRef } from 'react'
import { getTelegramWebApp } from '../utils/telegram'
import { hasUserThemePreference, updateThemeColorMeta } from '../utils/theme'

function safeTelegramCall(action: () => void) {
  try {
    action()
  } catch (error) {
    console.warn('[Telegram WebApp]', error)
  }
}

function applyTelegramTheme() {
  if (hasUserThemePreference()) return

  const WebApp = getTelegramWebApp()
  if (!WebApp) return

  safeTelegramCall(() => {
    const { themeParams, colorScheme } = WebApp
    const theme = colorScheme === 'dark' ? 'dark' : 'light'

    document.documentElement.dataset.theme = theme
    updateThemeColorMeta(theme)

    const mappings: Array<[string, string | undefined]> = [
      ['--tg-bg', themeParams.bg_color],
      ['--tg-secondary-bg', themeParams.secondary_bg_color],
      ['--tg-text', themeParams.text_color],
      ['--tg-hint', themeParams.hint_color],
      ['--tg-link', themeParams.link_color],
      ['--tg-button', themeParams.button_color],
      ['--tg-button-text', themeParams.button_text_color],
    ]

    for (const [variable, value] of mappings) {
      if (value) {
        document.documentElement.style.setProperty(variable, value)
      }
    }

    if (typeof WebApp.setBackgroundColor === 'function' && themeParams.bg_color) {
      WebApp.setBackgroundColor(themeParams.bg_color)
    }
    if (
      typeof WebApp.setHeaderColor === 'function' &&
      themeParams.secondary_bg_color
    ) {
      WebApp.setHeaderColor(themeParams.secondary_bg_color)
    }
  })
}

export function useTelegram() {
  useEffect(() => {
    const WebApp = getTelegramWebApp()
    if (!WebApp) return

    safeTelegramCall(() => {
      WebApp.ready()
      WebApp.expand()
      applyTelegramTheme()
    })

    const handleThemeChange = () => applyTelegramTheme()

    safeTelegramCall(() => {
      WebApp.onEvent('themeChanged', handleThemeChange)
    })

    return () => {
      safeTelegramCall(() => {
        WebApp.offEvent('themeChanged', handleThemeChange)
      })
    }
  }, [])
}

export function useTelegramBackButton(
  visible: boolean,
  onClick: () => void,
) {
  const onClickRef = useRef(onClick)
  onClickRef.current = onClick

  useEffect(() => {
    const WebApp = getTelegramWebApp()
    if (!WebApp?.BackButton) return

    const handler = () => onClickRef.current()
    const backButton = WebApp.BackButton

    safeTelegramCall(() => {
      if (visible) {
        backButton.show()
        backButton.onClick(handler)
      } else {
        backButton.hide()
      }
    })

    return () => {
      safeTelegramCall(() => {
        backButton.offClick(handler)
        backButton.hide()
      })
    }
  }, [visible])
}
