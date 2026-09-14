import DataTable from '../Common/DataTable.jsx';
import StatusBadge from '../Common/StatusBadge.jsx';
import UserAction from './UserAction.jsx';
import { formatDate } from '../../utils/ForamteDate.js';

export default function UserTable({
  users = [],
  loading = false,
  onView,
  onActivate,
  onSuspend,
}) {
  const columns = [
    {
      header: 'User',
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
      header: 'Role',
      accessor: 'role',
      render: (row) => (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 6,
            background: row.role === 'MANAGER' ? 'rgba(99,102,241,0.1)' : 'rgba(16,185,129,0.1)',
            color: row.role === 'MANAGER' ? '#6366f1' : '#10b981',
          }}
        >
          {row.role}
        </span>
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
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Created',
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
        <UserAction
          user={row}
          onView={onView}
          onActivate={onActivate}
          onSuspend={onSuspend}
        />
      ),
    },
  ];

  return <DataTable columns={columns} data={users} loading={loading} />;
}
