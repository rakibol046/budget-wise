const SkeletonCard = ({ className = '' }) => (
  <div
    className={`rounded-2xl border p-6 overflow-hidden ${className}`}
    style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
  >
    <div className="shimmer h-4 w-24 rounded mb-4" style={{ minHeight: '16px' }} />
    <div className="shimmer h-8 w-32 rounded mb-2" style={{ minHeight: '32px' }} />
    <div className="shimmer h-3 w-20 rounded" style={{ minHeight: '12px' }} />
  </div>
);

export const SkeletonList = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="rounded-xl border p-4 flex items-center gap-4"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
      >
        <div className="shimmer h-10 w-10 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="shimmer h-4 w-32 rounded" />
          <div className="shimmer h-3 w-20 rounded" />
        </div>
        <div className="shimmer h-5 w-16 rounded" />
      </div>
    ))}
  </div>
);

export default SkeletonCard;
