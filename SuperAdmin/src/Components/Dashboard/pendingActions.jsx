import { Link } from 'react-router-dom';
import { CheckSquare, AlertTriangle, Clock } from 'lucide-react';

const ACTIONS = [
  { id: 1, icon: Clock,        color: '#f59e0b', title: 'Pending Hotel Approval', desc: 'Pearl Continental (Lahore) is awaiting KYC verification.', meta: 'Submitted 2h ago', to: '/approvals/pending', label: 'Review Now' },
  { id: 2, icon: AlertTriangle,color: '#ef4444', title: 'Subscription Expiring',  desc: 'Serena Hotel Premium plan expires in 2 days.',             meta: 'Auto-renew failed', to: '/subscriptions',    label: 'Send Reminder'  },
  { id: 3, icon: CheckSquare,  color: '#10b981', title: 'Manager Onboarding',     desc: 'Ali Khan (Avari Towers) uploaded missing ID documents.',   meta: 'Action required',   to: '/users',           label: 'Verify Docs'},
  { id: 4, icon: AlertTriangle,color: '#eab308', title: 'Payment Dispute',        desc: 'Hotel One raised a dispute for the recent commission fee.',meta: 'Amount: PKR 15,000',to: '/billing',         label: 'Resolve Issue' },
  { id: 5, icon: CheckSquare,  color: '#3b82f6', title: 'Payout Required',        desc: 'Monthly payout for Marriott Karachi is ready for transfer.',meta: 'Amount: PKR 8.2M', to: '/payouts',         label: 'Initiate' }
];

export default function PendingActions({ pendingCount = 0 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <div key={action.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-2)', transition: 'border-color var(--transition-fast)' }}>
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
