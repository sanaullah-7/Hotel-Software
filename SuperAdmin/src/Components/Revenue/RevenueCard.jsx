import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency.js';

export default function RevenueCard({ title, amount, change, isPositive = true, icon: Icon, period = 'vs last month' }) {
  return (
    <div className="card hover-lift" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{title}</span>
        {Icon && (
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'rgba(99,102,241,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-purple)',
            }}
          >
            <Icon size={18} />
          </div>
        )}
      </div>

      <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
        {typeof amount === 'number' ? formatCurrency(amount) : amount}
      </div>

      {change && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              fontWeight: 600,
              color: isPositive ? '#10b981' : '#ef4444',
            }}
          >
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {change}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>{period}</span>
        </div>
      )}
    </div>
  );
}
