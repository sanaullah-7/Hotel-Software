import { Link } from 'react-router-dom';
import { CheckSquare, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

export default function PendingActions({ pendingCount = 0, hotelStats = null }) {
  const pendingApprovals = pendingCount || hotelStats?.pending || 0;
  const suspendedCount = hotelStats?.suspended || 0;

  const actions = [];

  if (pendingApprovals > 0) {
    actions.push({
      id: 'pending-hotels',
      icon: Clock,
      color: '#f59e0b',
      title: `${pendingApprovals} Pending Hotel Approval${pendingApprovals > 1 ? 's' : ''}`,
      desc: 'New property applications require verification and database provisioning.',
      meta: 'Action Required',
      to: '/hotels/pending',
      label: 'Review Now',
    });
  }

  if (suspendedCount > 0) {
    actions.push({
      id: 'suspended-hotels',
      icon: AlertTriangle,
      color: '#ef4444',
      title: `${suspendedCount} Suspended Hotel${suspendedCount > 1 ? 's' : ''}`,
      desc: 'Hotels currently disabled due to overdue subscription dues or admin review.',
      meta: 'Attention',
      to: '/hotels?status=SUSPENDED',
      label: 'Inspect',
    });
  }

  // If no urgent actions, show clean all-clear status
  if (actions.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '28px 16px', 
        textAlign: 'center',
        background: 'var(--color-surface-2)',
        borderRadius: 8,
        border: '1px solid var(--color-border)'
      }}>
        <div style={{ 
          width: 40, 
          height: 40, 
          borderRadius: '50%', 
          background: 'var(--color-success-bg, #10b98120)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: 10
        }}>
          <CheckCircle size={22} style={{ color: '#10b981' }} />
        </div>
        <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 4px', color: 'var(--color-text-primary)' }}>
          All Systems Operational
        </p>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0, maxWidth: 300 }}>
          No pending hotel applications or critical platform alerts awaiting review.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <div key={action.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-2)', transition: 'border-color var(--transition-fast)' }}>
            <div style={{ width: 32, height: 32, borderRadius: 6, background: `${action.color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} style={{ color: action.color }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <p style={{ fontSize: 13.5, fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                  {action.title}
                </p>
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 12, background: 'var(--color-surface-3)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  {action.meta}
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.4 }}>{action.desc}</p>
            </div>
            <Link to={action.to} className="btn btn-sm" style={{ flexShrink: 0, whiteSpace: 'nowrap', backgroundColor: 'var(--color-surface-3)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}>
              {action.label}
            </Link>
          </div>
        );
      })}
    </div>
  );
}
