import { useEffect, useRef, useState } from 'react'

interface CountUpProps {
  value: number
  decimals?: number
  suffix?: string
  className?: string
  duration?: number
}

export function CountUp({
  value,
  decimals = 2,
  suffix = '',
  className = '',
  duration = 500,
}: CountUpProps) {
  const [display, setDisplay] = useState(value)
  const previousRef = useRef(value)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    const from = previousRef.current
    const to = value
    previousRef.current = to

    if (Math.abs(from - to) < 0.001) {
      setDisplay(to)
      return
    }

    const start = performance.now()

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - progress) ** 3
      setDisplay(from + (to - from) * eased)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      }
    }

    frameRef.current = requestAnimationFrame(tick)

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [value, duration])

  const formatted = `${display.toFixed(decimals)}${suffix}`

  return <span className={className}>{formatted}</span>
}
