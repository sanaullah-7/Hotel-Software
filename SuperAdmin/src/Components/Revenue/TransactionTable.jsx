import DataTable from '../Common/DataTable.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/ForamteDate.js';

export default function TransactionTable({ transactions = [], loading = false }) {
  const columns = [
    {
      header: 'Tx ID',
      accessor: 'id',
      render: (row) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: 'var(--accent-purple)' }}>
          {row.id}
        </span>
      ),
    },
    {
      header: 'Hotel Name',
      accessor: 'hotelName',
      render: (row) => (
        <span style={{ fontWeight: 600, fontSize: 13 }}>{row.hotelName}</span>
      ),
    },
    {
      header: 'Plan',
      accessor: 'plan',
      render: (row) => (
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{row.plan}</span>
      ),
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (row) => (
        <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      header: 'Method',
      accessor: 'method',
      render: (row) => (
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{row.method}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => {
        const isSuccess = row.status?.toUpperCase() === 'SUCCESS';
        return (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 999,
              background: isSuccess ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
              color: isSuccess ? '#10b981' : '#ef4444',
              border: isSuccess ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)',
            }}
          >
            {row.status}
          </span>
        );
      },
    },
    {
      header: 'Date',
      accessor: 'date',
      render: (row) => (
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {formatDate(row.date)}
        </span>
      ),
    },
  ];

  return <DataTable columns={columns} data={transactions} loading={loading} />;
}
