import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * KPI Stat card with value, trend, label, and icon.
 * @param {{ title: string, value: string|number, trend?: number, trendLabel?: string, icon: React.Component, color?: string }} props
 */
export default function StatCard({ title, value, trend, trendLabel, icon: Icon, color = '#6366f1', onClick }) {
  const isPositive = trend > 0;
  const isNeutral  = trend === 0 || trend === undefined || trend === null;
  const TrendIcon  = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
  const trendColor = isNeutral ? 'var(--color-text-muted)' : isPositive ? 'var(--color-success)' : 'var(--color-error)';

  return (
    <div
      className="sa-stat-card"
      onClick={onClick}
      style={{ ...(onClick ? { cursor: 'pointer' } : {}), padding: '8px 12px', gap: '6px' }}
    >
      {/* Top row: icon + trend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}1a`, flexShrink: 0 }}>
          <Icon size={16} style={{ color }} />
        </div>
        {trend !== undefined && trend !== null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: trendColor, fontSize: 11, fontWeight: 600 }}>
            <TrendIcon size={12} />
            {isNeutral ? '0%' : `${isPositive ? '+' : ''}${trend.toFixed(1)}%`}
          </div>
        )}
      </div>

      {/* Value */}
      <div>
        <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', lineHeight: 1, marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {value}
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 0, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </div>
      </div>

      {/* Trend label */}
      {trendLabel && (
        <div style={{ fontSize: 11.5, color: 'var(--color-text-muted)' }}>{trendLabel}</div>
      )}
    </div>
  );
}
