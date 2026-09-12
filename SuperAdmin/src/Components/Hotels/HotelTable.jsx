import { useState, useCallback } from 'react';
import { Eye, CheckCircle, XCircle, Ban, RefreshCw, MoreHorizontal, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../Common/StatusBadge.jsx';
import ConfirmModal from '../Common/confirmModel.jsx';
import { HotelService } from '../../Services/HotelService.js';
import { useSuperAdmin } from '../../Context/SuperAdminContext.jsx';
import { formatDate } from '../../utils/ForamteDate.js';

export default function HotelTable({ data, onRefresh }) {
  const navigate = useNavigate();
  const { toast } = useSuperAdmin();
  const [confirm, setConfirm] = useState(null); // { type, hotel }
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleAction = useCallback(async () => {
    if (!confirm) return;
    setActionLoading(true);
    try {
      const { type, hotel } = confirm;
      if (type === 'approve')   await HotelService.approveHotel(hotel.id);
      if (type === 'reject')    await HotelService.rejectHotel(hotel.id, rejectReason);
      if (type === 'suspend')   await HotelService.suspendHotel(hotel.id, 'Suspended by admin');
      if (type === 'reactivate')await HotelService.reactivateHotel(hotel.id);
      toast.success(`Hotel ${type}d successfully.`);
      setConfirm(null);
      setRejectReason('');
      onRefresh?.();
    } catch (e) {
      toast.error(e.message || `Failed to ${confirm?.type} hotel.`);
    } finally {
      setActionLoading(false);
    }
  }, [confirm, rejectReason, toast, onRefresh]);

  const dropdownBtnStyle = {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 12px', border: 'none',
    cursor: 'pointer', fontSize: 13, fontWeight: 500,
    background: 'transparent', color: 'var(--color-text-primary)',
    width: '100%', textAlign: 'left',
  };

  return (
    <>
      <div className="sa-table-wrap">
        <table className="sa-table">
          <thead>
            <tr>
              <th>Hotel</th>
              <th>Manager</th>
              <th>City</th>
              <th>Status</th>
              <th>Registered</th>
              <th style={{ width: 180 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((hotel) => (
              <tr key={hotel.id}>
                <td>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{hotel.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--color-text-muted)' }}>{hotel.email}</div>
                </td>
                <td>
                  <div style={{ fontSize: 13 }}>{hotel.managerName}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--color-text-muted)' }}>{hotel.managerEmail}</div>
                </td>
                <td style={{ fontSize: 13 }}>{hotel.city}</td>
                <td><StatusBadge status={hotel.status} /></td>
                <td style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>{formatDate(hotel.createdAt)}</td>
                <td>
                  <div style={{ position: 'relative' }}>
                    <button 
                      onClick={() => setOpenDropdown(openDropdown === hotel.id ? null : hotel.id)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--color-text-secondary)' }}
                    >
                      <MoreHorizontal size={18} />
                    </button>

                    {openDropdown === hotel.id && (
                      <div style={{
                        position: 'absolute', right: 0, top: '100%',
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 8,
                        boxShadow: 'var(--shadow-md)',
                        zIndex: 10,
                        minWidth: 140,
                        display: 'flex', flexDirection: 'column',
                        overflow: 'hidden'
                      }}>
                        <button 
                          style={dropdownBtnStyle} 
                          onClick={() => { navigate(`/hotels/${hotel.id}`); setOpenDropdown(null); }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-2)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <Eye size={14} /> View
                        </button>

                        <button 
                          style={dropdownBtnStyle} 
                          onClick={() => { navigate(`/hotels/${hotel.id}/edit`); setOpenDropdown(null); }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-2)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <Edit size={14} /> Edit
                        </button>
                        
                        {hotel.status === 'PENDING' && (
                          <>
                            <button 
                              style={{...dropdownBtnStyle, color: 'var(--color-success)'}} 
                              onClick={() => { setConfirm({ type:'approve', hotel }); setOpenDropdown(null); }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-success-bg)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <CheckCircle size={14} /> Approve
                            </button>
                            <button 
                              style={{...dropdownBtnStyle, color: 'var(--color-error)'}} 
                              onClick={() => { setConfirm({ type:'reject', hotel }); setRejectReason(''); setOpenDropdown(null); }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-error-bg)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </>
                        )}
                        
                        {hotel.status === 'ACTIVE' && (
                          <button 
                            style={{...dropdownBtnStyle, color: 'var(--color-warning)'}} 
                            onClick={() => { setConfirm({ type:'suspend', hotel }); setOpenDropdown(null); }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-warning-bg)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <Ban size={14} /> Suspend
                          </button>
                        )}
                        
                        {hotel.status === 'SUSPENDED' && (
                          <button 
                            style={{...dropdownBtnStyle, color: 'var(--color-success)'}} 
                            onClick={() => { setConfirm({ type:'reactivate', hotel }); setOpenDropdown(null); }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-success-bg)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <RefreshCw size={14} /> Reactivate
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Approval confirm */}
      <ConfirmModal
        open={confirm?.type === 'approve'}
        onClose={() => setConfirm(null)}
        onConfirm={handleAction}
        title="Approve Hotel"
        message={`Approve "${confirm?.hotel?.name}"? The manager will gain access to their dashboard.`}
        confirmLabel="Approve"
        confirmVariant="btn-success"
        loading={actionLoading}
      />

      {/* Rejection confirm with reason */}
      <ConfirmModal
        open={confirm?.type === 'reject'}
        onClose={() => { setConfirm(null); setRejectReason(''); }}
        onConfirm={handleAction}
        title="Reject Registration"
        message={`Provide a reason for rejecting "${confirm?.hotel?.name}".`}
        confirmLabel="Reject Application"
        confirmVariant="btn-danger"
        loading={actionLoading}
      >
        <textarea
          className="sa-input sa-textarea"
          placeholder="Rejection reason (required)…"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={3}
          style={{ marginTop: 0 }}
        />
      </ConfirmModal>

      {/* Suspend confirm */}
      <ConfirmModal
        open={confirm?.type === 'suspend'}
        onClose={() => setConfirm(null)}
        onConfirm={handleAction}
        title="Suspend Hotel"
        message={`Suspend "${confirm?.hotel?.name}"? Hotel users will lose access immediately.`}
        confirmLabel="Suspend Hotel"
        confirmVariant="btn-warning"
        loading={actionLoading}
      />

      {/* Reactivate confirm */}
      <ConfirmModal
        open={confirm?.type === 'reactivate'}
        onClose={() => setConfirm(null)}
        onConfirm={handleAction}
        title="Reactivate Hotel"
        message={`Reactivate "${confirm?.hotel?.name}"? Hotel users will regain access.`}
        confirmLabel="Reactivate"
        confirmVariant="btn-success"
        loading={actionLoading}
      />
    </>
  );
}
