import StatusBadge from '../Common/StatusBadge.jsx';
import {  MapPin, FileText, CheckCircle, XCircle, Calendar, Hash } from 'lucide-react';
import { formatDate } from '../../utils/ForamteDate.js';

export default function ApprovelDetails({ approval, onApprove, onReject }) {
  if (!approval) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Info */}
      <div style={{ padding: 18, borderRadius: 12, background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700 }}>{approval.hotelName}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
              <MapPin size={14} /> {approval.city}, Pakistan
            </div>
          </div>
          <StatusBadge status={approval.status} />
        </div>

        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)', paddingTop: 10, borderTop: '1px solid var(--border-color)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Hash size={13} /> NTN: <strong>{approval.registrationNumber || 'Pending'}</strong>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Calendar size={13} /> Submitted: {formatDate(approval.submittedAt)}
          </span>
        </div>
      </div>

      {/* Manager Information */}
      <div className="card" style={{ padding: 16 }}>
        <h4 style={{ margin: '0 0 12px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Applicant / General Manager Details
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Full Name:</span>
            <strong>{approval.managerName}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Official Email:</span>
            <span>{approval.managerEmail}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Contact Phone:</span>
            <span>{approval.managerPhone || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Property Specifications */}
      <div className="card" style={{ padding: 16 }}>
        <h4 style={{ margin: '0 0 12px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Property Capacity & Verification
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Declared Rooms:</span>
            <strong>{approval.roomsCount || 0} Rooms</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>City Jurisdiction:</span>
            <span>{approval.city}</span>
          </div>
        </div>
      </div>

      {/* Verification Documents */}
      <div className="card" style={{ padding: 16 }}>
        <h4 style={{ margin: '0 0 12px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Submitted Legal Documentation
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {['FBR NTN Tax Certificate', 'Commercial Hotel License (DTS)', 'Manager CNIC / National Identity Card'].map((doc, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 8,
                background: 'var(--bg-card-hover)',
                border: '1px solid var(--border-color)',
                fontSize: 13,
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={15} color="var(--accent-purple)" />
                {doc}
              </span>
              <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>Attached (Verified)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Approval / Rejection Controls */}
      {approval.status === 'PENDING' && (
        <div style={{ display: 'flex', gap: 12, paddingTop: 10 }}>
          {onApprove && (
            <button
              onClick={() => onApprove(approval)}
              className="btn btn-primary"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#10b981', borderColor: '#10b981' }}
            >
              <CheckCircle size={16} /> Approve Hotel
            </button>
          )}
          {onReject && (
            <button
              onClick={() => onReject(approval)}
              className="btn"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}
            >
              <XCircle size={16} /> Reject Application
            </button>
          )}
        </div>
      )}
    </div>
  );
}
