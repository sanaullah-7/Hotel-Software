import DataTable from '../Common/DataTable.jsx';
import { formatDate } from '../../utils/ForamteDate.js';

const ACTION_COLORS = {
  HOTEL_APPROVED: { label: 'Hotel Approved', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  HOTEL_REJECTED: { label: 'Hotel Rejected', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  HOTEL_SUSPENDED: { label: 'Hotel Suspended', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  HOTEL_ACTIVATED: { label: 'Hotel Activated', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  USER_SUSPENDED: { label: 'User Suspended', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  USER_ACTIVATED: { label: 'User Activated', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  SETTINGS_CHANGED: { label: 'Settings Changed', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  LOGIN: { label: 'Admin Login', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
};

export default function AuditLogTable({ logs = [], loading = false }) {
  const columns = [
    {
      header: 'Action',
      accessor: 'action',
      render: (row) => {
        const conf = ACTION_COLORS[row.action] || { label: row.action, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };
        return (
          <span
            style={{
              display: 'inline-block',
              padding: '2px 8px',
              borderRadius: 6,
              fontSize: 11.5,
              fontWeight: 600,
              color: conf.color,
              background: conf.bg,
            }}
          >
            {conf.label}
          </span>
        );
      },
    },
    {
      header: 'Performed By',
      accessor: 'performedBy',
      render: (row) => (
        <span style={{ fontWeight: 600, fontSize: 13 }}>{row.performedBy}</span>
      ),
    },
    {
      header: 'Target Entity',
      accessor: 'targetName',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 13 }}>{row.targetName}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Type: {row.targetEntity}</div>
        </div>
      ),
    },
    {
      header: 'IP Address',
      accessor: 'ipAddress',
      render: (row) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>
          {row.ipAddress || '127.0.0.1'}
        </span>
      ),
    },
    {
      header: 'Timestamp',
      accessor: 'timestamp',
      render: (row) => (
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {formatDate(row.timestamp)}
        </span>
      ),
    },
  ];

  return <DataTable columns={columns} data={logs} loading={loading} />;
}
