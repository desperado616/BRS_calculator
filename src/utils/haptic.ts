export function triggerHaptic(
  style: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light',
) {
  try {
    const haptic = window.Telegram?.WebApp?.HapticFeedback
    if (!haptic) return

    if (style === 'success' || style === 'warning' || style === 'error') {
      haptic.notificationOccurred(style)
      return
    }

    haptic.impactOccurred(style)
  } catch {
    // ignore
  }
}
