import { Bell, Hotel, Shield, CreditCard, User, CheckCircle } from 'lucide-react';
import { formatDate } from '../../utils/ForamteDate.js';

const TYPE_ICONS = {
  HOTEL_REGISTRATION: { icon: Hotel, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  APPROVAL_REQUEST: { icon: Shield, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  SUBSCRIPTION_EXPIRING: { icon: CreditCard, color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
  USER_REPORT: { icon: User, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
  SYSTEM: { icon: Bell, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
};

export default function NotificationItem({ notification, onMarkRead }) {
  const iconConfig = TYPE_ICONS[notification.type] || TYPE_ICONS.SYSTEM;
  const Icon = iconConfig.icon;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        padding: 14,
        borderRadius: 10,
        background: notification.isRead ? 'var(--bg-card)' : 'var(--bg-card-hover)',
        border: '1px solid var(--border-color)',
        borderLeft: notification.isRead
          ? '1px solid var(--border-color)'
          : `3px solid ${iconConfig.color}`,
        transition: 'all var(--transition-fast)',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: iconConfig.bg,
          color: iconConfig.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={18} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
          <h4
            style={{
              margin: 0,
              fontSize: 13.5,
              fontWeight: notification.isRead ? 600 : 700,
              color: 'var(--text-primary)',
            }}
          >
            {notification.title}
          </h4>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {formatDate(notification.createdAt)}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.4 }}>
          {notification.message}
        </p>
      </div>

      {!notification.isRead && onMarkRead && (
        <button
          onClick={() => onMarkRead(notification.id)}
          title="Mark as read"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--accent-purple)',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <CheckCircle size={16} />
        </button>
      )}
    </div>
  );
}
