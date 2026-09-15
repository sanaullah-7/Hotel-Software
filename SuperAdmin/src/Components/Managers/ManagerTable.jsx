import DataTable from '../Common/DataTable.jsx';
import StatusBadge from '../Common/StatusBadge.jsx';
import { Eye, CheckCircle, Ban } from 'lucide-react';
import { formatDate } from '../../utils/ForamteDate.js';

export default function ManagerTable({
  managers = [],
  loading = false,
  onView,
  onActivate,
  onSuspend,
}) {
  const columns = [
    {
      header: 'Manager',
      accessor: 'name',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {row.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{row.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Assigned Hotel',
      accessor: 'hotelName',
      render: (row) => (
        <span style={{ fontSize: 13, fontWeight: 500 }}>
          {row.hotelName || <span style={{ color: 'var(--text-muted)' }}>—</span>}
        </span>
      ),
    },
    {
      header: 'Phone',
      accessor: 'phone',
      render: (row) => (
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{row.phone || 'N/A'}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Joined',
      accessor: 'createdAt',
      render: (row) => (
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
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
          {row.status === 'SUSPENDED' ? (
            onActivate && (
              <button
                onClick={() => onActivate(row)}
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
                onClick={() => onSuspend(row)}
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
      ),
    },
  ];

  return <DataTable columns={columns} data={managers} loading={loading} />;
}
