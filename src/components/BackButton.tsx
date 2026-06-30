interface BackButtonProps {
  onClick: () => void
  label?: string
}

export function BackButton({ onClick, label = 'Назад' }: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="icon-btn back-btn -ml-1 shrink-0 rounded-full text-[var(--tg-text)] active:bg-[var(--tg-separator)]"
      aria-label={label}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <path
          d="M15 18l-6-6 6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
