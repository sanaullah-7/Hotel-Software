import { useState, useEffect, useCallback } from 'react';
import { UserService } from '../../Services/UserService.js';
import { useSuperAdmin } from '../../Context/SuperAdminContext.jsx';
import StatusBadge from '../../Components/Common/StatusBadge.jsx';
import SearchBar from '../../Components/Common/SearchBar.jsx';
import FilterDropdown from '../../Components/Common/FilterDropdown.jsx';
import Pagination from '../../Components/Common/Pagination.jsx';
import PageHeader from '../../Components/Common/pageHeader.jsx';
import EmptyState from '../../Components/Common/EmptyState.jsx';
import ErrorState from '../../Components/Common/ErrorState.jsx';
import ConfirmModal from '../../Components/Common/confirmModel.jsx';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants.js';
import { formatDate, timeAgo } from '../../utils/ForamteDate.js';
import { Users, CheckCircle, Ban } from 'lucide-react';

const ROLE_OPTIONS   = [{ value:'', label:'All Roles' },   { value:'MANAGER', label:'Managers' },    { value:'RECEPTIONIST', label:'Receptionists' }];
const STATUS_OPTIONS = [{ value:'', label:'All Statuses' },{ value:'ACTIVE',  label:'Active' },      { value:'PENDING', label:'Pending' }, { value:'SUSPENDED', label:'Suspended' }];

export default function UserPage() {
  const { toast } = useSuperAdmin();
  const [data,     setData]     = useState([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [search,   setSearch]   = useState('');
  const [role,     setRole]     = useState('');
  const [status,   setStatus]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [confirm,  setConfirm]  = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
     
    setLoading(true); setError('');
    try {
      const res = await UserService.getUsers({ page, limit: DEFAULT_PAGE_SIZE, role, status, search });
      setData(res.data); setTotal(res.total);
    } catch (e) { setError(e.message || 'Failed to load users.'); }
    finally { setLoading(false); }
  }, [page, role, status, search]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setPage(1); }, [role, status, search]);

  const handleAction = async () => {
    if (!confirm) return;
    setActionLoading(true);
    try {
      if (confirm.type === 'activate') await UserService.activateUser(confirm.user.id);
      if (confirm.type === 'suspend')  await UserService.suspendUser(confirm.user.id);
      toast.success(`User ${confirm.type}d successfully.`);
       
      setConfirm(null); fetchData();
    } catch (e) { toast.error(e.message || 'Action failed.'); }
    finally { setActionLoading(false); }
  };

  const roleColor = (r) => r === 'MANAGER' ? 'var(--color-primary)' : 'var(--color-accent)';
  const roleBg    = (r) => r === 'MANAGER' ? 'var(--color-primary-light)' : 'var(--color-accent-light)';

  return (
    <div className="animate-fadein">
      <PageHeader title="User Management" subtitle="Manage all platform users by role and status." />

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search users, email, hotel…" />
        <FilterDropdown label="Role"   value={role}   onChange={setRole}   options={ROLE_OPTIONS}   />
        <FilterDropdown label="Status" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
        <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--color-text-muted)' }}>
          {!loading && `${total} user${total !== 1 ? 's' : ''}`}
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : data.length === 0 && !loading ? (
        <EmptyState icon={Users} title="No users found" description="No users match your current filters." />
      ) : (
        <>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Hotel</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Last Login</th>
                  <th style={{ width: 130 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                      <td key={j}><div className="skeleton" style={{ height: 13, borderRadius: 6 }} /></td>
                    ))}</tr>
                  ))
                ) : data.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: roleBg(user.role), display: 'flex', alignItems: 'center', justifyContent: 'center', color: roleColor(user.role), fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                          {user.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--color-text-muted)' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 6, fontWeight: 500, background: roleBg(user.role), color: roleColor(user.role) }}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: 13 }}>{user.hotelName || '—'}</div>
                    </td>
                    <td><StatusBadge status={user.status} /></td>
                    <td style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>{formatDate(user.createdAt)}</td>
                    <td style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>{user.lastLogin ? timeAgo(user.lastLogin) : 'Never'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 5 }}>
                        {(user.status === 'PENDING' || user.status === 'SUSPENDED') && (
                          <button className="btn btn-sm btn-success" onClick={() => setConfirm({ type:'activate', user })} aria-label={`Activate ${user.name}`}>
                            <CheckCircle size={13} /> Activate
                          </button>
                        )}
                        {user.status === 'ACTIVE' && (
                          <button className="btn btn-sm btn-warning" onClick={() => setConfirm({ type:'suspend', user })} aria-label={`Suspend ${user.name}`}>
                            <Ban size={13} /> Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} total={total} pageSize={DEFAULT_PAGE_SIZE} onPageChange={setPage} />
        </>
      )}

      <ConfirmModal open={confirm?.type==='activate'} onClose={()=>setConfirm(null)} onConfirm={handleAction} title="Activate User" message={`Activate "${confirm?.user?.name}"? They will be able to log in.`} confirmLabel="Activate" confirmVariant="btn-success" loading={actionLoading} />
      <ConfirmModal open={confirm?.type==='suspend'}  onClose={()=>setConfirm(null)} onConfirm={handleAction} title="Suspend User"  message={`Suspend "${confirm?.user?.name}"? They will lose platform access.`} confirmLabel="Suspend" confirmVariant="btn-warning" loading={actionLoading} />
    </div>
  );
}
