import pkg from '../../package.json'

export const APP_VERSION = pkg.version

export function formatAppSubtitle(suffix = 'Калькулятор БРС · ЮУрГУ'): string {
  return `${suffix} · v${APP_VERSION}`
}
