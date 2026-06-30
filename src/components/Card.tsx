import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'hero' | 'inset'
}

const variants = {
  default: 'card',
  hero: 'card card-hero',
  inset: 'card-inset',
}

export function Card({
  children,
  className = '',
  variant = 'default',
}: CardProps) {
  return (
    <div className={`${variants[variant]} ${className}`.trim()}>{children}</div>
  )
}
