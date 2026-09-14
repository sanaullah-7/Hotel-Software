import Drawer from '../../Components/Common/Drawer.jsx';
import SubscriptionStatusBadge from '../../Components/Subscriptions/SubscriptionStatusBadge.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/ForamteDate.js';

export default function SubscriptionDetails({ subscription, isOpen, onClose }) {
  if (!subscription) return null;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Subscription Details">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header */}
        <div style={{ padding: 16, borderRadius: 12, background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{subscription.hotelName}</h3>
            <SubscriptionStatusBadge status={subscription.status} />
          </div>
          <div style={{ fontSize: 13, color: 'var(--accent-purple)', fontWeight: 600 }}>
            {subscription.planName} Tier
          </div>
        </div>

        {/* Financial info */}
        <div className="card" style={{ padding: 16 }}>
          <h4 style={{ margin: '0 0 12px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Billing & Invoicing
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Monthly Rate:</span>
              <strong>{formatCurrency(subscription.amount)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Payment Channel:</span>
              <span>{subscription.paymentMethod}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Billing Cycle:</span>
              <span>Monthly Recurring</span>
            </div>
          </div>
        </div>

        {/* Timelines */}
        <div className="card" style={{ padding: 16 }}>
          <h4 style={{ margin: '0 0 12px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Subscription Dates
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Started On:</span>
              <span>{formatDate(subscription.startDate)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Renews / Expires:</span>
              <strong style={{ color: '#ef4444' }}>{formatDate(subscription.endDate)}</strong>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
