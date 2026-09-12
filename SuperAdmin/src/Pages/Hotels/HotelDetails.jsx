import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { HotelService } from '../../Services/HotelService.js';
import { useSuperAdmin } from '../../Context/SuperAdminContext.jsx';
import StatusBadge from '../../Components/Common/StatusBadge.jsx';
import ConfirmModal from '../../Components/Common/confirmModel.jsx';
import LoadingState from '../../Components/Common/LaodingState.jsx';
import ErrorState from '../../Components/Common/ErrorState.jsx';
import { formatDate } from '../../utils/ForamteDate.js';
import { ArrowLeft, Hotel, User, Calendar, Phone, Mail, MapPin, Star, CheckCircle, XCircle, Ban, RefreshCw } from 'lucide-react';

export default function HotelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useSuperAdmin();
  const [hotel,   setHotel]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [confirm, setConfirm] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchHotel = useCallback(async () => {
    setLoading(true); setError('');
    try { setHotel(await HotelService.getHotelById(id)); }
    catch (e) { setError(e.message || 'Failed to load hotel details.'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchHotel(); }, [fetchHotel]);

  const handleAction = async () => {
    if (!confirm) return;
    setActionLoading(true);
    try {
      if (confirm === 'approve')   await HotelService.approveHotel(id);
      if (confirm === 'reject')    await HotelService.rejectHotel(id, rejectReason);
      if (confirm === 'suspend')   await HotelService.suspendHotel(id, 'Suspended by admin');
      if (confirm === 'reactivate')await HotelService.reactivateHotel(id);
      toast.success(`Hotel ${confirm}d successfully.`);
      setConfirm(null); setRejectReason('');
      fetchHotel();
    } catch (e) { toast.error(e.message || 'Action failed.'); }
    finally { setActionLoading(false); }
  };

  if (loading) return <LoadingState message="Loading hotel details…" />;
  if (error)   return <ErrorState message={error} onRetry={fetchHotel} />;
  if (!hotel)  return null;

  const infoRow = (label, value, Icon) => (
    <div className="sa-info-row">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {Icon && <Icon size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />}
        <span className="sa-info-label">{label}</span>
      </div>
      <span className="sa-info-value">{value || '—'}</span>
    </div>
  );

  return (
    <div className="animate-fadein">
      {/* Back + header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={15} /> Back
        </button>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{hotel.name}</h2>
        <StatusBadge status={hotel.status} />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {hotel.status === 'PENDING' && (<>
            <button className="btn btn-success" onClick={() => setConfirm('approve')}><CheckCircle size={15}/> Approve</button>
            <button className="btn btn-danger"  onClick={() => { setConfirm('reject'); setRejectReason(''); }}><XCircle size={15}/> Reject</button>
          </>)}
          {hotel.status === 'ACTIVE'    && <button className="btn btn-warning" onClick={() => setConfirm('suspend')}><Ban size={15}/> Suspend</button>}
          {hotel.status === 'SUSPENDED' && <button className="btn btn-success" onClick={() => setConfirm('reactivate')}><RefreshCw size={15}/> Reactivate</button>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16 }}>
        {/* Hotel Info */}
        <div className="sa-card">
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Hotel size={16} style={{ color: 'var(--color-primary)' }} /> Hotel Information
          </h3>
          {infoRow('Name',     hotel.name)}
          {infoRow('Address',  hotel.address, MapPin)}
          {infoRow('City',     hotel.city)}
          {infoRow('Province', hotel.province)}
          {infoRow('Country',  hotel.country)}
          {infoRow('Phone',    hotel.phone,  Phone)}
          {infoRow('Email',    hotel.email,  Mail)}
          {infoRow('Rooms',    hotel.totalRooms ? `${hotel.totalRooms} rooms` : '—')}
          {infoRow('Rating',   hotel.rating ? `${hotel.rating} / 5` : '—', Star)}
        </div>

        {/* Manager Info */}
        <div className="sa-card">
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={16} style={{ color: 'var(--color-primary)' }} /> Manager Information
          </h3>
          {infoRow('Name',  hotel.managerName)}
          {infoRow('Email', hotel.managerEmail, Mail)}
        </div>

        {/* Registration Info */}
        <div className="sa-card">
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={16} style={{ color: 'var(--color-primary)' }} /> Registration Details
          </h3>
          {infoRow('Registered',    formatDate(hotel.createdAt))}
          {infoRow('Status',        hotel.status)}
          {infoRow('Plan',          hotel.subscriptionPlan)}
          {hotel.rejectionReason && infoRow('Rejection Reason', hotel.rejectionReason)}
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal open={confirm==='approve'} onClose={()=>setConfirm(null)} onConfirm={handleAction} title="Approve Hotel" message={`Approve "${hotel.name}"? The manager will gain access.`} confirmLabel="Approve" confirmVariant="btn-success" loading={actionLoading} />
      <ConfirmModal open={confirm==='reject'} onClose={()=>{setConfirm(null);setRejectReason('');}} onConfirm={handleAction} title="Reject Registration" message={`Provide a reason for rejecting "${hotel.name}".`} confirmLabel="Reject" confirmVariant="btn-danger" loading={actionLoading}>
        <textarea className="sa-input sa-textarea" placeholder="Rejection reason…" value={rejectReason} onChange={(e)=>setRejectReason(e.target.value)} rows={3} />
      </ConfirmModal>
      <ConfirmModal open={confirm==='suspend'} onClose={()=>setConfirm(null)} onConfirm={handleAction} title="Suspend Hotel" message={`Suspend "${hotel.name}"? Users will lose access.`} confirmLabel="Suspend" confirmVariant="btn-warning" loading={actionLoading} />
      <ConfirmModal open={confirm==='reactivate'} onClose={()=>setConfirm(null)} onConfirm={handleAction} title="Reactivate Hotel" message={`Reactivate "${hotel.name}"?`} confirmLabel="Reactivate" confirmVariant="btn-success" loading={actionLoading} />
    </div>
  );
}
