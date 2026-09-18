import { Eye, CheckCircle, Ban } from 'lucide-react';

export default function ReceptionistActions({
  receptionist,
  onView,
  onActivate,
  onSuspend,
}) {
  const isSuspended = receptionist.status === 'SUSPENDED';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
      {onView && (
        <button
          onClick={() => onView(receptionist)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '5px 8px',
            borderRadius: 6,
            background: 'var(--bg-card-hover)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          <Eye size={13} style={{ marginRight: 4 }} />
          View
        </button>
      )}

      {isSuspended ? (
        onActivate && (
          <button
            onClick={() => onActivate(receptionist)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '5px 8px',
              borderRadius: 6,
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            <CheckCircle size={13} style={{ marginRight: 4 }} />
            Activate
          </button>
        )
      ) : (
        onSuspend && (
          <button
            onClick={() => onSuspend(receptionist)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '5px 8px',
              borderRadius: 6,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            <Ban size={13} style={{ marginRight: 4 }} />
            Suspend
          </button>
        )
      )}
    </div>
  );
}
