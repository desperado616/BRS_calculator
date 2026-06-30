interface RatingGaugeProps {
  value: number
  label?: string
  size?: number
}

function gaugeColor(value: number): string {
  if (value >= 85) return 'var(--tg-success)'
  if (value >= 60) return '#f59e0b'
  return 'var(--tg-destructive)'
}

export function RatingGauge({ value, label, size = 96 }: RatingGaugeProps) {
  const stroke = 8
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(100, Math.max(0, value))
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      aria-hidden={label ? undefined : true}
      aria-label={label}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--tg-separator)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={gaugeColor(clamped)}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="gauge-ring transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      <span className="absolute text-center">
        <span className="block text-lg font-bold tabular-nums leading-none">
          {clamped.toFixed(0)}
        </span>
        <span className="mt-0.5 block text-[0.625rem] uppercase tracking-wide text-[var(--tg-hint)]">
          %
        </span>
      </span>
    </div>
  )
}
