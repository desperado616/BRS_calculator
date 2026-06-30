export const APP_VERSION = __APP_VERSION__

export function formatAppSubtitle(suffix = 'Калькулятор БРС · ЮУрГУ'): string {
  return `${suffix} · v${APP_VERSION}`
}
