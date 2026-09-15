const STATUS_CONFIG = {
  OPEN: { label: 'Open', bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
  IN_PROGRESS: { label: 'In Progress', bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' },
  RESOLVED: { label: 'Resolved', bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: 'rgba(16, 185, 129, 0.3)' },
  CLOSED: { label: 'Closed', bg: 'rgba(100, 116, 139, 0.12)', color: '#94a3b8', border: 'rgba(100, 116, 139, 0.3)' },
};

export default function TicketStatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status?.toUpperCase()] || {
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
