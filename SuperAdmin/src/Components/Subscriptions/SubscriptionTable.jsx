import DataTable from '../Common/DataTable.jsx';
import SubscriptionStatusBadge from './SubscriptionStatusBadge.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/ForamteDate.js';
import { Eye } from 'lucide-react';

export default function SubscriptionTable({
  subscriptions = [],
  loading = false,
  onViewDetails,
}) {
  const columns = [
    {
      header: 'Hotel Name',
      accessor: 'hotelName',
      render: (row) => (
        <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
          {row.hotelName}
        </span>
      ),
    },
    {
      header: 'Plan',
      accessor: 'planName',
      render: (row) => (
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 6,
            background: 'rgba(99,102,241,0.1)',
            color: 'var(--accent-purple)',
          }}
        >
          {row.planName}
        </span>
      ),
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (row) => (
        <span style={{ fontWeight: 600, fontSize: 13 }}>
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <SubscriptionStatusBadge status={row.status} />,
    },
    {
      header: 'Expiry / Renewal',
      accessor: 'endDate',
      render: (row) => (
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {formatDate(row.endDate)}
        </span>
      ),
    },
    {
      header: 'Payment Method',
      accessor: 'paymentMethod',
      render: (row) => (
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {row.paymentMethod}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(row)}
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
              Manage
            </button>
          )}
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={subscriptions} loading={loading} />;
}
