import { useState, useEffect, useCallback } from 'react';
import { NotificationService } from '../../Services/NotificationService.js';
import { useSuperAdmin } from '../../Context/SuperAdminContext.jsx';
import PageHeader from '../../Components/Common/pageHeader.jsx';
import ErrorState from '../../Components/Common/ErrorState.jsx';
import EmptyState from '../../Components/Common/EmptyState.jsx';
import { timeAgo } from '../../utils/ForamteDate.js';
import { Bell, CheckCircle, AlertTriangle, Info, XCircle, Circle, MailOpen } from 'lucide-react';

const TYPE_ICONS = {
  success: { icon: CheckCircle,   color: 'var(--color-success)' },
  warning: { icon: AlertTriangle, color: 'var(--color-warning)' },
  error:   { icon: XCircle,       color: 'var(--color-error)'   },
  info:    { icon: Info,          color: 'var(--color-info)'    },
};

export default function Notifications() {
  const { toast, setUnreadCount } = useSuperAdmin();
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await NotificationService.getNotifications();
      setData(res.data);
    } catch (e) { setError(e.message || 'Failed to load notifications.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const markRead = async (id) => {
    await NotificationService.markAsRead(id).catch(() => {});
    setData((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await NotificationService.markAllAsRead().catch(() => {});
    setData((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    toast.success('All notifications marked as read.');
  };

  const unreadCount = data.filter((n) => !n.read).length;

  return (
    <div className="animate-fadein">
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
        actions={unreadCount > 0 && (
          <button className="btn btn-secondary btn-sm" onClick={markAllRead} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MailOpen size={14} /> Mark All as Read
          </button>
        )}
      />

      {error ? <ErrorState message={error} onRetry={fetchData} /> :
       data.length === 0 && !loading ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up! No notifications to display." />
      ) : (
        <div className="sa-card" style={{ padding: 0 }}>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: 12 }}>
                <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="skeleton" style={{ height: 13, width: '60%' }} />
                  <div className="skeleton" style={{ height: 11, width: '80%' }} />
                </div>
              </div>
            ))
          ) : data.map((n, i) => {
            const conf = TYPE_ICONS[n.type] || TYPE_ICONS.info;
            const Icon = conf.icon;
            return (
              <div
                key={n.id}
                style={{
                  display: 'flex', gap: 14, padding: '14px 20px',
                  borderBottom: i < data.length - 1 ? '1px solid var(--color-border)' : 'none',
                  background: !n.read ? 'var(--color-primary-light)' : 'transparent',
                  cursor: !n.read ? 'pointer' : 'default',
                  transition: 'background var(--transition-fast)',
                }}
                onClick={() => !n.read && markRead(n.id)}
              >
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${conf.color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={17} style={{ color: conf.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <p style={{ fontSize: 13.5, fontWeight: n.read ? 500 : 700, margin: 0 }}>{n.title}</p>
                      <p style={{ fontSize: 12.5, color: 'var(--color-text-secondary)', margin: '3px 0 0', lineHeight: 1.5 }}>{n.message}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <span style={{ fontSize: 11.5, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{timeAgo(n.createdAt)}</span>
                      {!n.read && <Circle size={8} style={{ color: 'var(--color-primary)', fill: 'var(--color-primary)' }} />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
