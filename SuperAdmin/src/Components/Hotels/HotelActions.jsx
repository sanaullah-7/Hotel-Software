import { Eye, Check, X, Ban, RefreshCw } from 'lucide-react';

export default function HotelActions({
  hotel,
  onView,
  onApprove,
  onReject,
  onSuspend,
  onActivate,
}) {
  const isPending = hotel.status === 'PENDING';
  const isSuspended = hotel.status === 'SUSPENDED';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
      {onView && (
        <button
          onClick={() => onView(hotel)}
          title="View Hotel Profile"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '5px 8px',
            borderRadius: 6,
            background: 'var(--bg-card-hover)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          <Eye size={13} />
          View
        </button>
      )}

      {isPending && onApprove && (
        <button
          onClick={() => onApprove(hotel)}
          title="Approve Hotel"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '5px 8px',
            borderRadius: 6,
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10b981',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <Check size={13} strokeWidth={2.5} />
          Approve
        </button>
      )}

      {isPending && onReject && (
        <button
          onClick={() => onReject(hotel)}
          title="Reject Hotel"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '5px 8px',
            borderRadius: 6,
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <X size={13} strokeWidth={2.5} />
          Reject
        </button>
      )}

      {isSuspended && onActivate && (
        <button
          onClick={() => onActivate(hotel)}
          title="Reactivate Hotel"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '5px 8px',
            borderRadius: 6,
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10b981',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <RefreshCw size={13} />
          Reactivate
        </button>
      )}

      {!isSuspended && !isPending && onSuspend && (
        <button
          onClick={() => onSuspend(hotel)}
          title="Suspend Hotel"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '5px 8px',
            borderRadius: 6,
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          <Ban size={13} />
          Suspend
        </button>
      )}
    </div>
  );
}
