import DataTable from '../Common/DataTable.jsx';
import TicketStatusBadge from './TicketStatusBadge.jsx';
import { Eye } from 'lucide-react';

const PRIORITY_COLORS = {
  HIGH: '#ef4444',
  MEDIUM: '#f59e0b',
  LOW: '#10b981',
};

export default function TicketTable({ tickets = [], loading = false, onView }) {
  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      render: (row) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: 'var(--accent-purple)' }}>
          {row.id}
        </span>
      ),
    },
    {
      header: 'Subject & Hotel',
      accessor: 'subject',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{row.subject}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.hotelName}</div>
        </div>
      ),
    },
    {
      header: 'Submitted By',
      accessor: 'submittedBy',
      render: (row) => (
        <span style={{ fontSize: 12 }}>{row.submittedBy}</span>
      ),
    },
    {
      header: 'Priority',
      accessor: 'priority',
      render: (row) => (
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: PRIORITY_COLORS[row.priority] || '#94a3b8',
          }}
        >
          {row.priority}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <TicketStatusBadge status={row.status} />,
    },
    {
      header: 'Created',
      accessor: 'createdAt',
      render: (row) => (
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{row.createdAt}</span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {onView && (
            <button
              onClick={() => onView(row)}
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
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={tickets} loading={loading} />;
}
