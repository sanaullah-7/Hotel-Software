import { useState, useEffect, useCallback } from 'react';
import { HotelService } from '../../Services/HotelService.js';
import HotelTable from '../../Components/Hotels/HotelTable.jsx';
import SearchBar from '../../Components/Common/SearchBar.jsx';
import FilterDropdown from '../../Components/Common/FilterDropdown.jsx';
import Pagination from '../../Components/Common/Pagination.jsx';
import PageHeader from '../../Components/Common/pageHeader.jsx';
import EmptyState from '../../Components/Common/EmptyState.jsx';
import ErrorState from '../../Components/Common/ErrorState.jsx';

import { Hotel } from 'lucide-react';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants.js';

const STATUS_OPTIONS = [
  { value: '',          label: 'All Statuses'  },
  { value: 'ACTIVE',    label: 'Active'         },
  { value: 'PENDING',   label: 'Pending'        },
  { value: 'SUSPENDED', label: 'Suspended'      },
  { value: 'REJECTED',  label: 'Rejected'       },
];

export default function Hotels() {
  const [data,     setData]     = useState([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search,   setSearch]   = useState('');
  const [status,   setStatus]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  const fetchData = useCallback(async () => {
     
    setLoading(true);
    setError('');
    try {
      const res = await HotelService.getHotels({ page, limit: pageSize, status, search });
      setData(res.data);
      setTotal(res.total);
    } catch (e) {
      setError(e.message || 'Failed to load hotels.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, status, search]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  // Reset to page 1 when filters change
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setPage(1); }, [status, search]);

  return (
    <div className="animate-fadein">
      <PageHeader
        title="All Hotels"
        subtitle="Manage all registered hotels on the platform."
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search hotels, managers, cities…" />
        <FilterDropdown label="Status" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
        <div style={{ marginLeft: 'auto', color: 'var(--color-text-muted)', fontSize: 13 }}>
          {!loading && `${total} hotel${total !== 1 ? 's' : ''}`}
        </div>
      </div>

      {/* Table */}
      {error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : data.length === 0 && !loading ? (
        <EmptyState icon={Hotel} title="No hotels found" description="No hotels match your current search and filters." />
      ) : (
        <>
          <HotelTable data={data} loading={loading} onRefresh={fetchData} />
          // eslint-disable-next-line react-hooks/set-state-in-effect
          <Pagination page={page} total={total} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
        </>
      )}
    </div>
  );
}
