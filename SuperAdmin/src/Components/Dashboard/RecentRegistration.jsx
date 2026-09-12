import { Link } from 'react-router-dom';
import StatusBadge from '../Common/StatusBadge.jsx';
import { timeAgo } from '../../utils/ForamteDate.js';

export default function RecentRegistration({ data = [] }) {
  return (
    <div>
      {data.length === 0 && <p style={{ color: 'var(--color-text-muted)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>No recent registrations.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {data.map((item, i) => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < data.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--color-primary)', fontWeight: 700, fontSize: 14 }}>
              {item.name?.charAt(0)?.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
              <p style={{ fontSize: 11.5, color: 'var(--color-text-muted)', margin: 0 }}>{item.managerName} · {item.city} · {timeAgo(item.registeredAt)}</p>
            </div>
            <StatusBadge status={item.status} size="sm" />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
        <Link to="/approvals/pending" style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 500 }}>View all approvals →</Link>
      </div>
    </div>
  );
}
