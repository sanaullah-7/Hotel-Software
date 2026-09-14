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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: 0 }}>
      {data.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>No recent activity.</p>
      )}
      {data.map((item, i) => {
        const conf = ICON_MAP[item.type] || { icon: Clock, color: 'var(--color-text-muted)' };
        const Icon = conf.icon;
        const isLast = i === data.length - 1;
        
        return (
          <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, position: 'relative', paddingBottom: isLast ? 4 : 16 }}>
            {/* Vertical Connecting Line */}
            {!isLast && (
              <div style={{ position: 'absolute', left: 13, top: 28, bottom: -4, width: 2, backgroundColor: 'var(--color-border)', zIndex: 0 }} />
            )}
            
            {/* Timeline Icon */}
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${conf.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, border: `2px solid var(--color-surface)` }}>
              <Icon size={12} style={{ color: conf.color }} />
            </div>
            
            {/* Content Payload */}
            <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>{item.title}</span>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 12, backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontWeight: 600, letterSpacing: '0.02em' }}>
                    {item.target}
                  </span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{timeAgo(item.time)}</span>
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--color-text-secondary)', margin: '0 0 8px 0', lineHeight: 1.5 }}>{item.message}</p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={12} style={{ color: 'var(--color-text-muted)' }} />
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 500 }}>Action by {item.user}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
