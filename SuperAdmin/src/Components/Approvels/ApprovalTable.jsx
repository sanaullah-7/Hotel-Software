import DataTable from '../Common/DataTable.jsx';
import StatusBadge from '../Common/StatusBadge.jsx';
import { formatDate } from '../../utils/ForamteDate.js';
import { Check, X, Eye } from 'lucide-react';

export default function ApprovalTable({
  approvals = [],
  loading = false,
  onReview,
  onApprove,
  onReject,
}) {
  const columns = [
    {
      header: 'Hotel Details',
      accessor: 'hotelName',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
            {row.hotelName}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {row.city} • {row.roomsCount || 'N/A'} Rooms
          </div>
        </div>
      ),
    },
    {
      header: 'Manager / Applicant',
      accessor: 'managerName',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 13 }}>{row.managerName}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.managerEmail}</div>
        </div>
      ),
    },
    {
      header: 'Registration No.',
      accessor: 'registrationNumber',
      render: (row) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: 'var(--accent-purple)' }}>
          {row.registrationNumber || 'NTN-PENDING'}
        </span>
      ),
    },
    {
      header: 'Submitted',
      accessor: 'submittedAt',
      render: (row) => (
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {formatDate(row.submittedAt)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => {
        const isPending = row.status === 'PENDING';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
            {onReview && (
              <button
                onClick={() => onReview(row)}
                title="Review Documents"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '5px 9px',
                  borderRadius: 6,
                  background: 'var(--bg-card-hover)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                <Eye size={13} />
                Review
              </button>
            )}

            {isPending && onApprove && (
              <button
                onClick={() => onApprove(row)}
                title="Approve Application"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '5px 9px',
                  borderRadius: 6,
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#10b981',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <Check size={13} strokeWidth={2.5} />
                Approve
              </button>
            )}

            {isPending && onReject && (
              <button
                onClick={() => onReject(row)}
                title="Reject Application"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '5px 9px',
                  borderRadius: 6,
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <X size={13} strokeWidth={2.5} />
                Reject
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={approvals} loading={loading} />;
}
