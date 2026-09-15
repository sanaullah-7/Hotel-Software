const STATUS_MAP = {
  ACTIVE: { label: 'Active', bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: 'rgba(16, 185, 129, 0.3)' },
  TRIAL: { label: 'Free Trial', bg: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' },
  EXPIRED: { label: 'Expired', bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
  CANCELLED: { label: 'Cancelled', bg: 'rgba(100, 116, 139, 0.12)', color: '#94a3b8', border: 'rgba(100, 116, 139, 0.3)' },
};

export default function SubscriptionStatusBadge({ status }) {
  const cfg = STATUS_MAP[status?.toUpperCase()] || {
    label: status || 'Unknown',
    bg: 'rgba(148, 163, 184, 0.12)',
    color: '#94a3b8',
    border: 'rgba(148, 163, 184, 0.3)',
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 9px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        backgroundColor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.label}
    </span>
  );
}
