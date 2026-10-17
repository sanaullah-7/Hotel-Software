import { useState, useEffect, useCallback } from 'react';
import { NotificationService } from '../../Services/NotificationService.js';
import { useSuperAdmin } from '../../Context/SuperAdminContext.jsx';
import PageHeader from '../../Components/Common/pageHeader.jsx';
import ErrorState from '../../Components/Common/ErrorState.jsx';
import EmptyState from '../../Components/Common/EmptyState.jsx';
import { timeAgo } from '../../utils/ForamteDate.js';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  XCircle, 
  Circle, 
  MailOpen, 
  Trash2, 
  RefreshCw,
  Filter
} from 'lucide-react';

const TYPE_ICONS = {
  success: { icon: CheckCircle,   color: 'var(--color-success)' },
  warning: { icon: AlertTriangle, color: 'var(--color-warning)' },
  error:   { icon: XCircle,       color: 'var(--color-error)'   },
  info:    { icon: Info,          color: 'var(--color-info)'    },
};

const CATEGORIES = [
  { id: '', label: 'All Alerts' },
  { id: 'unread', label: 'Unread' },
  { id: 'hotel', label: 'Hotels' },
  { id: 'subscription', label: 'Subscriptions' },
  { id: 'finance', label: 'Finance' },
  { id: 'system', label: 'System' },
];

export default function Notifications() {
  const { toast, setUnreadCount } = useSuperAdmin();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const query = {};
      if (activeCategory === 'unread') {
        query.read = 'false';
      } else if (activeCategory) {
        query.category = activeCategory;
      }
      const res = await NotificationService.getNotifications(query);
      setData(res.data || []);
      if (res.unreadCount !== undefined) {
        setUnreadCount(res.unreadCount);
      }
    } catch (e) {
      setError(e.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, [activeCategory, setUnreadCount]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const markRead = async (id, e) => {
    if (e) e.stopPropagation();
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

  const deleteNotification = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      const itemToDelete = data.find((n) => n.id === id);
      await NotificationService.deleteNotification(id);
      setData((prev) => prev.filter((n) => n.id !== id));
      if (itemToDelete && !itemToDelete.read) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      toast.success('Notification dismissed.');
    } catch {
      toast.error('Failed to dismiss notification.');
    }
  };

  const unreadCount = data.filter((n) => !n.read).length;

  return (
    <div className="animate-fadein">
      <PageHeader
        title="System Alerts & Notifications"
        subtitle={`${unreadCount} unread platform alert${unreadCount !== 1 ? 's' : ''}`}
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={fetchData}
              title="Refresh alerts"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <RefreshCw size={14} /> Refresh
            </button>
            {unreadCount > 0 && (
              <button
                className="btn btn-primary btn-sm"
                onClick={markAllRead}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <MailOpen size={14} /> Mark All as Read
              </button>
            )}
          </div>
        }
      />

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id || 'all'}
              onClick={() => setActiveCategory(cat.id)}
              className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                borderRadius: 20,
                padding: '6px 14px',
                fontSize: 12.5,
                fontWeight: isActive ? 600 : 500,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                flexShrink: 0,
              }}
            >
              {cat.id === '' && <Filter size={12} />}
              {cat.label}
            </button>
          );
        })}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : data.length === 0 && !loading ? (
        <EmptyState
          icon={Bell}
          title="No alerts found"
          description="You're all caught up! No notifications match the selected category."
        />
      ) : (
        <div className="sa-card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--color-border)',
                  display: 'flex',
                  gap: 12,
                }}
              >
                <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="skeleton" style={{ height: 13, width: '60%' }} />
                  <div className="skeleton" style={{ height: 11, width: '80%' }} />
                </div>
              </div>
            ))
          ) : (
            data.map((n, i) => {
              const conf = TYPE_ICONS[n.type] || TYPE_ICONS.info;
              const Icon = conf.icon;
              return (
                <div
                  key={n.id || n._id}
                  style={{
                    display: 'flex',
                    gap: 14,
                    padding: '16px 20px',
                    borderBottom: i < data.length - 1 ? '1px solid var(--color-border)' : 'none',
                    background: !n.read ? 'var(--color-primary-light, rgba(99, 102, 241, 0.08))' : 'transparent',
                    cursor: !n.read ? 'pointer' : 'default',
                    transition: 'background var(--transition-fast)',
                    position: 'relative',
                  }}
                  onClick={() => !n.read && markRead(n.id || n._id)}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: `${conf.color}1a`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={18} style={{ color: conf.color }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 13.5, fontWeight: n.read ? 600 : 700, color: 'var(--color-text-primary)' }}>
                            {n.title}
                          </span>
                          {n.category && (
                            <span
                              style={{
                                fontSize: 10.5,
                                textTransform: 'uppercase',
                                padding: '2px 7px',
                                borderRadius: 12,
                                fontWeight: 700,
                                letterSpacing: '0.04em',
                                background: 'var(--color-surface-2)',
                                color: 'var(--color-text-secondary)',
                                border: '1px solid var(--color-border)',
                              }}
                            >
                              {n.category}
                            </span>
                          )}
                        </div>
                        <p
                          style={{
                            fontSize: 12.5,
                            color: 'var(--color-text-secondary)',
                            margin: '4px 0 0',
                            lineHeight: 1.5,
                          }}
                        >
                          {n.message}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        <span style={{ fontSize: 11.5, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                          {timeAgo(n.createdAt)}
                        </span>
                        {!n.read && (
                          <Circle size={8} style={{ color: 'var(--color-primary)', fill: 'var(--color-primary)' }} />
                        )}
                        <button
                          onClick={(e) => deleteNotification(n.id || n._id, e)}
                          title="Dismiss alert"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-text-muted)',
                            cursor: 'pointer',
                            padding: 4,
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'color var(--transition-fast)',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-error)')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
