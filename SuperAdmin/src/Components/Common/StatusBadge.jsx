/**
 * StatusBadge — renders a colored pill for any status value.
 * @param {{ status: string, size?: 'sm'|'md' }} props
 */
const STATUS_MAP = {
  ACTIVE:    { label: 'Active',    cls: 'badge-success' },
  APPROVED:  { label: 'Approved',  cls: 'badge-success' },
  PENDING:   { label: 'Pending',   cls: 'badge-warning' },
  SUSPENDED: { label: 'Suspended', cls: 'badge-error'   },
  REJECTED:  { label: 'Rejected',  cls: 'badge-error'   },
  INACTIVE:  { label: 'Inactive',  cls: 'badge-neutral' },
  EXPIRED:   { label: 'Expired',   cls: 'badge-neutral' },
  CANCELED:  { label: 'Canceled',  cls: 'badge-neutral' },
  TRIAL:     { label: 'Trial',     cls: 'badge-info'    },
};

export default function StatusBadge({ status, size = 'md' }) {
  const config = STATUS_MAP[status?.toUpperCase()] || { label: status || 'Unknown', cls: 'badge-neutral' };
  const fontSize = size === 'sm' ? '0.7rem' : undefined;

  return (
    <span className={`badge ${config.cls}`} style={fontSize ? { fontSize } : undefined}>
      {config.label}
    </span>
  );
}
