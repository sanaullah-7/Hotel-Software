import { useState, useEffect, useCallback } from 'react';
import { ApprovalService } from '../../Services/ApprovlService.js';
import { useSuperAdmin } from '../../Context/SuperAdminContext.jsx';
import StatusBadge from '../../Components/Common/StatusBadge.jsx';
import ConfirmModal from '../../Components/Common/confirmModel.jsx';
import SearchBar from '../../Components/Common/SearchBar.jsx';
import Pagination from '../../Components/Common/Pagination.jsx';
import PageHeader from '../../Components/Common/pageHeader.jsx';
import EmptyState from '../../Components/Common/EmptyState.jsx';
import ErrorState from '../../Components/Common/ErrorState.jsx';
import Drawer from '../../Components/Common/Drawer.jsx';
import { formatDate } from '../../utils/ForamteDate.js';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants.js';
import { CheckSquare, Eye, CheckCircle, XCircle, MapPin, Phone, Mail, User, Calendar, Building2 } from 'lucide-react';

export default function PendingHotels() {
  const { toast, refreshUnreadCount } = useSuperAdmin();
  const [data,      setData]      = useState([]);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [selected,  setSelected]  = useState(null);
  const [drawerOpen,setDrawerOpen]= useState(false);
  const [confirm,   setConfirm]   = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await ApprovalService.getApprovals({ status: 'PENDING', page, limit: DEFAULT_PAGE_SIZE, search });
      setData(res.data); setTotal(res.total);
    } catch (e) { setError(e.message || 'Failed to load pending approvals.'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [search]);

  const handleAction = async () => {
    if (!confirm) return;
    setActionLoading(true);
    try {
      if (confirm.type === 'approve') await ApprovalService.approveRequest(confirm.item.id);
      if (confirm.type === 'reject')  await ApprovalService.rejectRequest(confirm.item.id, rejectReason);
      toast.success(`Application ${confirm.type}d successfully.`);
      setConfirm(null); setRejectReason(''); setDrawerOpen(false); setSelected(null);
      fetchData(); refreshUnreadCount();
    } catch (e) { toast.error(e.message || 'Action failed.'); }
    finally { setActionLoading(false); }
  };

  const openDrawer = (item) => { setSelected(item); setDrawerOpen(true); };

  const infoItem = (Icon, label, value) => (
    <div className="sa-info-row">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon size={14} style={{ color: 'var(--color-text-muted)' }} />
        <span className="sa-info-label">{label}</span>
      </div>
      <span className="sa-info-value">{value || '—'}</span>
    </div>
  );

  return (
    <div className="animate-fadein">
      <PageHeader
        title="Pending Approvals"
        subtitle={`${total} hotel registration${total !== 1 ? 's' : ''} awaiting review`}
      />

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search hotel or manager…" />
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : data.length === 0 && !loading ? (
        <EmptyState icon={CheckSquare} title="No Pending Approvals" description="There are currently no hotel registrations waiting for review. You're all caught up!" />
      ) : (
        <>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Hotel</th>
                  <th>Manager</th>
                  <th>Location</th>
                  <th>Plan</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th style={{ width: 180 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                      <td key={j}><div className="skeleton" style={{ height: 14, borderRadius: 6 }} /></td>
                    ))}</tr>
                  ))
                ) : data.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{item.hotelName}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--color-text-muted)' }}>{item.email}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13 }}>{item.managerName}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--color-text-muted)' }}>{item.managerEmail}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>{item.city}, {item.province}</td>
                    <td>
                      <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 6, background: 'var(--color-primary-light)', color: 'var(--color-primary)', fontWeight: 500 }}>
                        {item.subscriptionPlan}
                      </span>
                    </td>
                    <td style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>{formatDate(item.registeredAt)}</td>
                    <td><StatusBadge status={item.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button className="btn btn-sm btn-ghost" onClick={() => openDrawer(item)} aria-label={`Review ${item.hotelName}`}><Eye size={13} /> Review</button>
                        <button className="btn btn-sm btn-success" onClick={() => setConfirm({ type: 'approve', item })} aria-label={`Approve ${item.hotelName}`}><CheckCircle size={13} /></button>
                        <button className="btn btn-sm btn-danger"  onClick={() => { setConfirm({ type: 'reject', item }); setRejectReason(''); }} aria-label={`Reject ${item.hotelName}`}><XCircle size={13} /></button>
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

      {/* Detail Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected?.hotelName || 'Hotel Details'}
        subtitle="Review registration request"
        footer={selected && selected.status === 'PENDING' && (
          <>
            <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => { setDrawerOpen(false); setTimeout(() => { setConfirm({ type: 'reject', item: selected }); setRejectReason(''); }, 150); }}>
              <XCircle size={14} /> Reject
            </button>
            <button className="btn btn-success btn-sm" style={{ flex: 1 }} onClick={() => { setDrawerOpen(false); setTimeout(() => setConfirm({ type: 'approve', item: selected }), 150); }}>
              <CheckCircle size={14} /> Approve
            </button>
          </>
        )}
      >
        {selected && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontWeight: 800, fontSize: 18 }}>
                  {selected.hotelName?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{selected.hotelName}</div>
                  <StatusBadge status={selected.status} size="sm" />
                </div>
              </div>
            </div>

            <div className="sa-section-title">Hotel Information</div>
            <div style={{ marginBottom: 20 }}>
              {infoItem(Building2, 'Hotel Name',  selected.hotelName)}
              {infoItem(MapPin,   'Address',      selected.address)}
              {infoItem(MapPin,   'City',         `${selected.city}, ${selected.province}`)}
              {infoItem(Phone,    'Phone',        selected.phone)}
              {infoItem(Mail,     'Email',        selected.email)}
            </div>

            <div className="sa-section-title">Manager Information</div>
            <div style={{ marginBottom: 20 }}>
              {infoItem(User,     'Name',  selected.managerName)}
              {infoItem(Mail,     'Email', selected.managerEmail)}
              {infoItem(Phone,    'Phone', selected.managerPhone)}
            </div>

            <div className="sa-section-title">Registration</div>
            {infoItem(Calendar,  'Submitted',     formatDate(selected.registeredAt))}
            {infoItem(Building2, 'Rooms',         selected.totalRooms ? `${selected.totalRooms} rooms` : '—')}
            {infoItem(Building2, 'Plan',          selected.subscriptionPlan)}
          </div>
        )}
      </Drawer>

      {/* Modals */}
      <ConfirmModal open={confirm?.type==='approve'} onClose={()=>setConfirm(null)} onConfirm={handleAction} title="Approve Registration" message={`Approve "${confirm?.item?.hotelName}"? The manager will gain access to their dashboard.`} confirmLabel="Approve" confirmVariant="btn-success" loading={actionLoading} />
      <ConfirmModal open={confirm?.type==='reject'} onClose={()=>{setConfirm(null);setRejectReason('');}} onConfirm={handleAction} title="Reject Registration" message={`Provide a reason for rejecting "${confirm?.item?.hotelName}".`} confirmLabel="Reject" confirmVariant="btn-danger" loading={actionLoading}>
        <textarea className="sa-input sa-textarea" placeholder="Rejection reason (required)…" value={rejectReason} onChange={(e)=>setRejectReason(e.target.value)} rows={3} />
      </ConfirmModal>
    </div>
  );
}
