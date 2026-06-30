export function LoadingSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      <div className="skeleton h-36" />
      <div className="skeleton h-14" />
      <div className="skeleton h-14" />
      <div className="skeleton h-14" />
    </div>
  )
}
