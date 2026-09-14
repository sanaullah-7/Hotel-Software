import { useState, useEffect, useCallback } from 'react';
import { ApprovalService } from '../../Services/ApprovlService.js';
import StatusBadge from '../../Components/Common/StatusBadge.jsx';
import SearchBar from '../../Components/Common/SearchBar.jsx';
import FilterDropdown from '../../Components/Common/FilterDropdown.jsx';
import Pagination from '../../Components/Common/Pagination.jsx';
import PageHeader from '../../Components/Common/pageHeader.jsx';
import EmptyState from '../../Components/Common/EmptyState.jsx';
import ErrorState from '../../Components/Common/ErrorState.jsx';
import { formatDate } from '../../utils/ForamteDate.js';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants.js';
import { Link } from 'react-router-dom';
import { CheckSquare, Eye } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '',         label: 'All Statuses' },
  { value: 'PENDING',  label: 'Pending'  },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

export default function Approvels() {
  const [data,   setData]   = useState([]);
  const [total,  setTotal]  = useState(0);
  const [page,   setPage]   = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading,setLoading]= useState(true);
  const [error,  setError]  = useState('');

  const fetchData = useCallback(async () => {
     
    setLoading(true); setError('');
    try {
      const res = await ApprovalService.getApprovals({ page, limit: DEFAULT_PAGE_SIZE, status, search });
      setData(res.data); setTotal(res.total);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [page, status, search]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setPage(1); }, [status, search]);

  return (
    <div className="animate-fadein">
      <PageHeader title="All Approvals" subtitle="Review hotel registration requests." />
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search hotel or manager…" />
        <FilterDropdown label="Status" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
      </div>
      {error ? <ErrorState message={error} onRetry={fetchData} /> :
       data.length === 0 && !loading ? <EmptyState icon={CheckSquare} title="No requests found" /> : (
        <>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead><tr><th>Hotel</th><th>Manager</th><th>City</th><th>Plan</th><th>Submitted</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? Array.from({length:5}).map((_,i)=><tr key={i}>{Array.from({length:7}).map((_,j)=><td key={j}><div className="skeleton" style={{height:13,borderRadius:6}}/></td>)}</tr>) :
                  data.map((item) => (
                    <tr key={item.id}>
                      <td><div style={{fontWeight:600,fontSize:13}}>{item.hotelName}</div><div style={{fontSize:11.5,color:'var(--color-text-muted)'}}>{item.email}</div></td>
                      <td style={{fontSize:13}}>{item.managerName}</td>
                      <td style={{fontSize:13}}>{item.city}</td>
                      <td><span style={{fontSize:12,padding:'2px 8px',borderRadius:6,background:'var(--color-primary-light)',color:'var(--color-primary)',fontWeight:500}}>{item.subscriptionPlan}</span></td>
                      <td style={{fontSize:12.5,color:'var(--color-text-muted)'}}>{formatDate(item.registeredAt)}</td>
                      <td><StatusBadge status={item.status}/></td>
                      <td>
                        {item.status === 'PENDING' && (
                          <Link to="/hotels/pending" className="btn btn-sm btn-ghost"><Eye size={13}/> Review</Link>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} total={total} pageSize={DEFAULT_PAGE_SIZE} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
