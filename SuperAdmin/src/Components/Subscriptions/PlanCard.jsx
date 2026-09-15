import { Check, Zap } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency.js';

export default function PlanCard({ plan, onSelectPlan }) {
  const isEnterprise = plan.tier === 'ENTERPRISE';

  return (
    <div
      className="card hover-lift"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        padding: 24,
        border: plan.isPopular
          ? '2px solid var(--accent-purple)'
          : '1px solid var(--border-color)',
        borderRadius: 16,
        background: 'var(--bg-card)',
      }}
    >
      {plan.isPopular && (
        <div
          style={{
            position: 'absolute',
            top: -12,
            right: 20,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: 999,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Zap size={12} fill="#fff" />
          POPULAR
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700 }}>{plan.name}</h3>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
          {isEnterprise ? 'For luxury chains & enterprise hotels' : 'Ideal for modern boutique hotels'}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 20 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>
          {formatCurrency(plan.price)}
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/{plan.billingPeriod}</span>
      </div>

      <div style={{ flex: 1, marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
          Included Features:
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {plan.features.map((f, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Check size={11} strokeWidth={3} />
              </div>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {plan.activeSubscribers} Active Hotels
        </span>
        {onSelectPlan && (
          <button
            onClick={() => onSelectPlan(plan)}
            className="btn btn-primary"
            style={{ padding: '7px 14px', fontSize: 12 }}
          >
            Manage Plan
          </button>
        )}
      </div>
    </div>
  );
}
