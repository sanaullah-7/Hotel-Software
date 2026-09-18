import SubscriptionStatusBadge from './SubscriptionStatusBadge.jsx';
import { Building2, Calendar, CreditCard } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/ForamteDate.js';

export default function SubscriptionCard({ subscription, onManage }) {
  return (
    <div className="card hover-lift" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
            <Building2 size={18} />
          </div>
          <div>
            <h4 style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 600 }}>{subscription.hotelName}</h4>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{subscription.planName}</span>
          </div>
        </div>
        <SubscriptionStatusBadge status={subscription.status} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '14px 0', fontSize: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
          <CreditCard size={14} />
          <span>Amount: <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(subscription.amount)}</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
          <Calendar size={14} />
          <span>Renews: <strong style={{ color: 'var(--text-primary)' }}>{formatDate(subscription.endDate)}</strong></span>
        </div>
      </div>

      {onManage && (
        <button
          onClick={() => onManage(subscription)}
          style={{
            width: '100%',
            padding: '7px',
            borderRadius: 6,
            background: 'var(--bg-card-hover)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          View Subscription Details
        </button>
      )}
    </div>
  );
}
