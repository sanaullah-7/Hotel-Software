import { useState } from 'react';
import PageHeader from '../../Components/Common/pageHeader.jsx';
import RevenueFilters from '../../Components/Revenue/RevenueFilters.jsx';
import TransactionTable from '../../Components/Revenue/TransactionTable.jsx';
import Pagination from '../../Components/Common/Pagination.jsx';
import ReportButton from '../../Components/Reports/ReportButton.jsx';
import { useRevenue } from '../../Hooks/useRevenue.js';

export default function Transaction() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [period, setPeriod] = useState('all');
  const [page, setPage] = useState(1);

  const {
    transactions,
    total,
    loading,
    error,
    setParams,
  } = useRevenue({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    period: 'all',
  });

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
    setParams((prev) => ({ ...prev, search: val, page: 1 }));
  };

  const handleStatusChange = (val) => {
    setStatus(val);
    setPage(1);
    setParams((prev) => ({ ...prev, status: val, page: 1 }));
  };

  const handlePeriodChange = (val) => {
    setPeriod(val);
    setPage(1);
    setParams((prev) => ({ ...prev, period: val, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="animate-fadein">
      <PageHeader
        title="Transaction Records & Ledger"
        subtitle="Complete immutable log of SaaS subscription payments, tenant setup fees, and renewal receipts."
        action={
          <ReportButton
            data={transactions}
            filename={`transactions_${new Date().toISOString().split('T')[0]}.csv`}
            label="Export Transactions CSV"
          />
        }
      />

      <div className="card" style={{ padding: 20 }}>
        <RevenueFilters
          search={search}
          onSearchChange={handleSearchChange}
          status={status}
          onStatusChange={handleStatusChange}
          period={period}
          onPeriodChange={handlePeriodChange}
        />

        {error && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 8,
              background: 'rgba(239,68,68,0.1)',
              color: '#ef4444',
              marginBottom: 16,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <TransactionTable transactions={transactions} loading={loading} />

        <div style={{ marginTop: 16 }}>
          <Pagination
            page={page}
            total={total}
            pageSize={10}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
