import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HotelService } from '../../Services/HotelService.js';
import { useSuperAdmin } from '../../Context/SuperAdminContext.jsx';
import StatusBadge from '../../Components/Common/StatusBadge.jsx';
import ConfirmModal from '../../Components/Common/confirmModel.jsx';
import LoadingState from '../../Components/Common/LaodingState.jsx';
import ErrorState from '../../Components/Common/ErrorState.jsx';
import { formatDate } from '../../utils/ForamteDate.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { 
  ArrowLeft, Hotel, User, Calendar, Phone, Mail, MapPin, 
  Star, CheckCircle, XCircle, Ban, RefreshCw, Layers, Database, 
  DollarSign, Users, BedDouble 
} from 'lucide-react';

export default function HotelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useSuperAdmin();
  const [hotel,         setHotel]         = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [confirm,       setConfirm]       = useState(null);
  const [rejectReason,  setRejectReason]  = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchHotel = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await HotelService.getHotelById(id);
      setHotel(data);
    } catch (e) {
      setError(e.message || 'Failed to load hotel details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { 
    fetchHotel(); 
  }, [fetchHotel]);

  const handleAction = async () => {
    if (!confirm) return;
    setActionLoading(true);
    try {
      if (confirm === 'approve') {
        await HotelService.approveHotel(id);
      }
      if (confirm === 'reject') {
        await HotelService.rejectHotel(id, rejectReason || 'Application rejected by platform administrator');
      }
      if (confirm === 'suspend') {
        await HotelService.suspendHotel(id, suspendReason || 'Suspended by Super Admin - Subscription/Rent overdue');
      }
      if (confirm === 'reactivate') {
        await HotelService.reactivateHotel(id);
      }
      toast.success(`Hotel ${confirm}d successfully.`);
      setConfirm(null);
      setRejectReason('');
      setSuspendReason('');
      fetchHotel();
    } catch (e) {
      toast.error(e.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
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
          {hotel.status === 'PENDING' && (
            <>
              <button className="btn btn-success" onClick={() => setConfirm('approve')}>
                <CheckCircle size={15}/> Approve Application
              </button>
              <button className="btn btn-danger" onClick={() => { setConfirm('reject'); setRejectReason(''); }}>
                <XCircle size={15}/> Reject
              </button>
            </>
          )}
          {hotel.status === 'ACTIVE' && (
            <button className="btn btn-warning" onClick={() => { setConfirm('suspend'); setSuspendReason(''); }}>
              <Ban size={15}/> Suspend Hotel
            </button>
          )}
          {hotel.status === 'SUSPENDED' && (
            <button className="btn btn-success" onClick={() => setConfirm('reactivate')}>
              <RefreshCw size={15}/> Reactivate Hotel
            </button>
          )}
          {hotel.status === 'REJECTED' && (
            <button className="btn btn-success" onClick={() => setConfirm('approve')}>
              <CheckCircle size={15}/> Reconsider & Approve
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16 }}>
        {/* Hotel Info */}
        <div className="sa-card">
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Hotel size={16} style={{ color: 'var(--color-primary)' }} /> Property Information
          </h3>
          {infoRow('Property Name', hotel.name)}
          {infoRow('Address',       hotel.address, MapPin)}
          {infoRow('City',          hotel.city)}
          {infoRow('Province',      hotel.province)}
          {infoRow('Country',       hotel.country || 'Pakistan')}
          {infoRow('Phone',         hotel.phone,  Phone)}
          {infoRow('Email',         hotel.email,  Mail)}
          {infoRow('Rating',        hotel.rating ? `${hotel.rating} / 5` : '4.8 / 5', Star)}
        </div>

        {/* Manager & Contact */}
        <div className="sa-card">
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={16} style={{ color: 'var(--color-primary)' }} /> Ownership & Management
          </h3>
          {infoRow('Primary Manager', hotel.managerName, User)}
          {infoRow('Email Address',   hotel.managerEmail, Mail)}
          {infoRow('Phone Number',    hotel.managerPhone, Phone)}
        </div>

        {/* Platform & Subscription Info */}
        <div className="sa-card">
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layers size={16} style={{ color: 'var(--color-primary)' }} /> Subscription & Platform
          </h3>
          {infoRow('Subscription Plan', hotel.subscriptionPlan)}
          {infoRow('Status',            hotel.status)}
          {infoRow('Tenant Database',   hotel.tenantDbName, Database)}
          {infoRow('Submitted On',      formatDate(hotel.createdAt), Calendar)}
          {hotel.approvedAt && infoRow('Approved At', formatDate(hotel.approvedAt), CheckCircle)}
          {hotel.suspendedAt && infoRow('Suspended At', formatDate(hotel.suspendedAt), Ban)}
          {hotel.rejectionReason && infoRow('Rejection Reason', hotel.rejectionReason)}
          {hotel.suspensionReason && infoRow('Suspension Reason', hotel.suspensionReason)}
        </div>

        {/* Live Tenant Metrics */}
        <div className="sa-card">
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <BedDouble size={16} style={{ color: 'var(--color-primary)' }} /> Live Property Metrics
          </h3>
          {infoRow('Configured Rooms',  `${hotel.totalRooms || 0} rooms`, BedDouble)}
          {infoRow('Active Bookings',   `${hotel.activeBookings || 0} stays`, Calendar)}
          {infoRow('Active Staff',      `${hotel.totalStaff || 0} employees`, Users)}
          {infoRow('Estimated Revenue', formatCurrency(hotel.revenue || 0), DollarSign)}
        </div>
      </div>

      {/* Approve Modal */}
      <ConfirmModal 
        open={confirm === 'approve'} 
        onClose={() => setConfirm(null)} 
        onConfirm={handleAction} 
        title="Approve Hotel Registration" 
        message={`Approve "${hotel.name}"? The tenant database will be active and the owner account will be unlocked.`} 
        confirmLabel="Approve Property" 
        confirmVariant="btn-success" 
        loading={actionLoading} 
      />

      {/* Reject Modal */}
      <ConfirmModal 
        open={confirm === 'reject'} 
        onClose={() => { setConfirm(null); setRejectReason(''); }} 
        onConfirm={handleAction} 
        title="Reject Hotel Application" 
        message={`Provide a clear reason for rejecting "${hotel.name}".`} 
        confirmLabel="Reject Application" 
        confirmVariant="btn-danger" 
        loading={actionLoading}
      >
        <textarea 
          className="sa-input sa-textarea" 
          placeholder="Reason for rejection (e.g. Incomplete license documentation)…" 
          value={rejectReason} 
          onChange={(e) => setRejectReason(e.target.value)} 
          rows={3} 
          style={{ marginTop: 8 }}
        />
      </ConfirmModal>

      {/* Suspend Modal */}
      <ConfirmModal 
        open={confirm === 'suspend'} 
        onClose={() => { setConfirm(null); setSuspendReason(''); }} 
        onConfirm={handleAction} 
        title="Suspend Hotel Property" 
        message={`Suspend "${hotel.name}"? All active staff sessions will be revoked and login access will be blocked immediately.`} 
        confirmLabel="Suspend Property" 
        confirmVariant="btn-warning" 
        loading={actionLoading}
      >
        <textarea 
          className="sa-input sa-textarea" 
          placeholder="Suspension reason (e.g. Subscription rent overdue, policy violation)…" 
          value={suspendReason} 
          onChange={(e) => setSuspendReason(e.target.value)} 
          rows={3} 
          style={{ marginTop: 8 }}
        />
      </ConfirmModal>

      {/* Reactivate Modal */}
      <ConfirmModal 
        open={confirm === 'reactivate'} 
        onClose={() => setConfirm(null)} 
        onConfirm={handleAction} 
        title="Reactivate Hotel Property" 
        message={`Reactivate "${hotel.name}"? Hotel managers and receptionists will regain access to their portal.`} 
        confirmLabel="Reactivate Property" 
        confirmVariant="btn-success" 
        loading={actionLoading} 
      />
    </div>
  );
}
