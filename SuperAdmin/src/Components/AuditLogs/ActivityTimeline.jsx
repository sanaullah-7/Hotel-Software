import { ShieldCheck, XCircle, AlertTriangle, UserCheck, Settings, LogIn } from 'lucide-react';
import { formatDate } from '../../utils/ForamteDate.js';

const ACTION_ICONS = {
  HOTEL_APPROVED: { icon: ShieldCheck, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  HOTEL_REJECTED: { icon: XCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  HOTEL_SUSPENDED: { icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  HOTEL_ACTIVATED: { icon: ShieldCheck, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  USER_SUSPENDED: { icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  USER_ACTIVATED: { icon: UserCheck, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  SETTINGS_CHANGED: { icon: Settings, color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  LOGIN: { icon: LogIn, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
};

export default function ActivityTimeline({ logs = [] }) {
  if (!logs.length) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>
        No recent audit actions recorded.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>
      {logs.map((log) => {
        const conf = ACTION_ICONS[log.action] || ACTION_ICONS.SETTINGS_CHANGED;
        const Icon = conf.icon;

        return (
          <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: conf.bg,
                color: conf.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                <span style={{ color: 'var(--text-primary)' }}>{log.performedBy}</span>{' '}
                <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>
                  performed {log.action.toLowerCase().replace(/_/g, ' ')} on
                </span>{' '}
                <span style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>{log.targetName}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                {formatDate(log.timestamp)} • IP: {log.ipAddress || '127.0.0.1'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
