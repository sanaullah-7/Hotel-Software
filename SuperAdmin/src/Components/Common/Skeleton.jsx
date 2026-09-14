/**
 * Skeleton shimmer shapes.
 */
export function SkeletonLine({ width = '100%', height = 14, style = {} }) {
  return <div className="skeleton" style={{ width, height, borderRadius: 6, ...style }} />;
}

export function SkeletonBlock({ width = '100%', height = 80, style = {} }) {
  return <div className="skeleton" style={{ width, height, borderRadius: 10, ...style }} />;
}

export function SkeletonAvatar({ size = 36 }) {
  return <div className="skeleton" style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0 }} />;
}

export function SkeletonCard() {
  return (
    <div className="sa-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SkeletonLine width="60%" height={14} />
      <SkeletonLine width="40%" height={28} />
      <SkeletonLine width="50%" height={12} />
    </div>
  );
}

export function SkeletonTableRow({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <SkeletonLine height={13} width={i === 0 ? '80%' : i === 1 ? '60%' : '70%'} />
        </td>
      ))}
    </tr>
  );
}

export default function LoadingSkeleton({ rows = 5, cols = 5 }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} cols={cols} />
      ))}
    </tbody>
  );
}
