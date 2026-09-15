import PageHeader from '../../Components/Common/pageHeader.jsx';
import { CreditCard, CheckCircle, Clock, XCircle } from 'lucide-react';

const PLANS = [
  { name: 'Basic',      price: 'PKR 4,999/mo',  features: ['Up to 50 rooms', 'Basic reporting', '1 Manager', '2 Receptionists'],          highlight: false },
  { name: 'Standard',   price: 'PKR 9,999/mo',  features: ['Up to 150 rooms', 'Advanced reporting', '2 Managers', '5 Receptionists'],     highlight: true  },
  { name: 'Premium',    price: 'PKR 19,999/mo', features: ['Up to 500 rooms', 'Full analytics', '5 Managers', 'Unlimited Receptionists'],  highlight: false },
  { name: 'Enterprise', price: 'Custom',        features: ['Unlimited rooms', 'Dedicated support', 'Custom integrations', 'SLA guarantee'], highlight: false },
];

const STATS = [
  { icon: CheckCircle, color:'#10b981', label: 'Active',  value: 3 },
  { icon: Clock,       color:'#f59e0b', label: 'Trial',   value: 1 },
  { icon: XCircle,     color:'#ef4444', label: 'Expired', value: 2 },
];

export default function Subscriptions() {
  return (
    <div className="animate-fadein">
      <PageHeader title="Subscriptions" subtitle="Manage hotel subscription plans and billing." />

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="sa-card" style={{ flex: 1, minWidth: 160, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} style={{ color: s.color }} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{s.label} Subscriptions</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Plans */}
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Available Plans</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
        {PLANS.map((plan) => (
          <div key={plan.name} className="sa-card" style={{ borderColor: plan.highlight ? 'var(--color-primary)' : 'var(--color-border)', position: 'relative', overflow: 'hidden' }}>
            {plan.highlight && <div style={{ position: 'absolute', top: 12, right: -28, background: 'var(--color-primary)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 36px', transform: 'rotate(45deg)', letterSpacing: '0.05em' }}>POPULAR</div>}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard size={18} style={{ color: 'var(--color-primary)' }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{plan.name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--color-primary)', fontWeight: 600 }}>{plan.price}</div>
              </div>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {plan.features.map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--color-text-secondary)' }}>
                  <CheckCircle size={13} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
