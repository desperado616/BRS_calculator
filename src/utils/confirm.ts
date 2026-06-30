import { getTelegramWebApp } from './telegram'

function canUseTelegramPopup(
  WebApp: NonNullable<ReturnType<typeof getTelegramWebApp>>,
): boolean {
  if (typeof WebApp.isVersionAtLeast === 'function') {
    return WebApp.isVersionAtLeast('6.2')
  }
  return false
}

export async function confirmAction(
  message: string,
  options: {
    title?: string
    confirmText?: string
    cancelText?: string
    destructive?: boolean
  } = {},
): Promise<boolean> {
  const WebApp = getTelegramWebApp()
  const confirmText = options.confirmText ?? 'Подтвердить'
  const destructive = options.destructive ?? true
  const fullMessage = options.title ? `${options.title}\n\n${message}` : message

  if (WebApp && canUseTelegramPopup(WebApp)) {
    return new Promise((resolve) => {
      try {
        WebApp.showPopup(
          {
            title: options.title,
            message,
            buttons: [
              { id: 'cancel', type: 'cancel' },
              {
                id: 'confirm',
                type: destructive ? 'destructive' : 'default',
                text: confirmText,
              },
            ],
          },
          (buttonId) => resolve(buttonId === 'confirm'),
        )
      } catch {
        resolve(window.confirm(fullMessage))
      }
    })
  }

  if (WebApp?.showConfirm) {
    return new Promise((resolve) => {
      try {
        WebApp.showConfirm(fullMessage, resolve)
      } catch {
        resolve(window.confirm(fullMessage))
      }
    })
  }

  return window.confirm(fullMessage)
}
