import { useState } from 'react';
import PageHeader from '../../Components/Common/pageHeader.jsx';
import RevenueFilters from '../../Components/Revenue/RevenueFilters.jsx';
import TransactionTable from '../../Components/Revenue/TransactionTable.jsx';
import ReportButton from '../../Components/Reports/ReportButton.jsx';
import { useRevenue } from '../../Hooks/useRevenue.js';

export default function Transaction() {
  const { transactions, loading } = useRevenue();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const filtered = transactions.filter((tx) => {
    if (status && tx.status?.toUpperCase() !== status) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        tx.id.toLowerCase().includes(q) ||
        tx.hotelName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="animate-fadein">
      <PageHeader
        title="Transaction Records"
        subtitle="Complete log of subscription payments, renewals, and refunds"
        action={<ReportButton data={filtered} filename="transactions.csv" label="Export Transactions" />}
      />

      <div className="card" style={{ padding: 20 }}>
        <RevenueFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
        />

        <TransactionTable transactions={filtered} loading={loading} />
      </div>
    </div>
  );
}
