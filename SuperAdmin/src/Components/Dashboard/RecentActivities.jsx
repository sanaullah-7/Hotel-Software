import { CheckCircle, Hotel, User, AlertTriangle, Star, Clock } from 'lucide-react';
import { timeAgo } from '../../utils/ForamteDate.js';

const ICON_MAP = {
  approval:     { icon: CheckCircle,   color: '#10b981' },
  registration: { icon: Hotel,         color: '#6366f1' },
  user:         { icon: User,          color: '#3b82f6' },
  suspension:   { icon: AlertTriangle, color: '#ef4444' },
  subscription: { icon: Star,          color: '#f59e0b' },
};

export default function RecentActivities({ data = [] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {data.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>No recent activity.</p>
      )}
      {data.map((item, i) => {
        const conf = ICON_MAP[item.type] || { icon: Clock, color: 'var(--color-text-muted)' };
        const Icon = conf.icon;
        return (
          <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: i < data.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${conf.color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={15} style={{ color: conf.color }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, color: 'var(--color-text-primary)', margin: 0, lineHeight: 1.4 }}>{item.message}</p>
              <p style={{ fontSize: 11.5, color: 'var(--color-text-muted)', marginTop: 3 }}>{timeAgo(item.time)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
