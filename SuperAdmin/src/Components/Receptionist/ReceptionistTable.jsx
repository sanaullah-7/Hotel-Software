import DataTable from '../Common/DataTable.jsx';
import StatusBadge from '../Common/StatusBadge.jsx';
import ReceptionistActions from './ReceptionistActions.jsx';
import { formatDate } from '../../utils/ForamteDate.js';

export default function ReceptionistTable({
  receptionists = [],
  loading = false,
  onView,
  onActivate,
  onSuspend,
}) {
  const columns = [
    {
      header: 'Receptionist',
      accessor: 'name',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
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
        <ReceptionistActions
          receptionist={row}
          onView={onView}
          onActivate={onActivate}
          onSuspend={onSuspend}
        />
      ),
    },
  ];

  return <DataTable columns={columns} data={receptionists} loading={loading} />;
}
