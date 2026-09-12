import { Link } from 'react-router-dom';
import { CheckSquare, AlertTriangle, Clock } from 'lucide-react';

const ACTIONS = [
  { id: 1, icon: Clock,        color: '#f59e0b', title: 'Pending Hotel Approvals', desc: 'Hotels awaiting your review and approval.', to: '/approvals/pending', label: 'Review Now' },
  { id: 2, icon: AlertTriangle,color: '#ef4444', title: 'Expiring Subscriptions',  desc: 'Some hotel subscriptions expire soon.',      to: '/subscriptions',    label: 'View Plans'  },
  { id: 3, icon: CheckSquare,  color: '#10b981', title: 'Pending User Accounts',   desc: 'Users waiting for account activation.',       to: '/users',           label: 'Manage Users'},
];

export default function PendingActions({ pendingCount = 0 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <div key={action.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-surface-2)', transition: 'border-color var(--transition-fast)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: `${action.color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} style={{ color: action.color }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>
                {action.title}{action.id === 1 && pendingCount > 0 && <span style={{ background: '#ef4444', color: '#fff', borderRadius: 99, fontSize: 10, fontWeight: 700, padding: '1px 6px', marginLeft: 6 }}>{pendingCount}</span>}
              </p>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>{action.desc}</p>
            </div>
            <Link to={action.to} className="btn btn-sm btn-outline" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>{action.label}</Link>
          </div>
        );
      })}
    </div>
  );
}
