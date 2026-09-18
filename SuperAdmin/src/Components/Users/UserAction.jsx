import { Eye, CheckCircle, Ban } from 'lucide-react';

export default function UserAction({ user, onView, onActivate, onSuspend }) {
  const isSuspended = user.status === 'SUSPENDED';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {onView && (
        <button
          onClick={() => onView(user)}
          title="View Details"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px 8px',
            borderRadius: 6,
            background: 'var(--bg-card-hover)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          <Eye size={14} style={{ marginRight: 4 }} />
          View
        </button>
      )}

      {isSuspended ? (
        onActivate && (
          <button
            onClick={() => onActivate(user)}
            title="Reactivate Account"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 8px',
              borderRadius: 6,
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            <CheckCircle size={14} style={{ marginRight: 4 }} />
            Activate
          </button>
        )
      ) : (
        onSuspend && (
          <button
            onClick={() => onSuspend(user)}
            title="Suspend Account"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 8px',
              borderRadius: 6,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            <Ban size={14} style={{ marginRight: 4 }} />
            Suspend
          </button>
        )
      )}
    </div>
  );
}
