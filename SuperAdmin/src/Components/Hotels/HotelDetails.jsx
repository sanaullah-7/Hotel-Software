import Drawer from '../Common/Drawer.jsx';
import HotelStatusBadge from './HotelStatusBadge.jsx';
import {  MapPin, Mail, Phone, Star, Bed, Hash, ShieldAlert } from 'lucide-react';

export default function HotelDetails({ hotel, isOpen, onClose, onSuspend, onActivate, onApprove }) {
  if (!hotel) return null;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Hotel Specifications">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header */}
        <div style={{ padding: 18, borderRadius: 12, background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700 }}>{hotel.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                <MapPin size={14} /> {hotel.city}, Pakistan
              </div>
            </div>
            <HotelStatusBadge status={hotel.status} />
          </div>

          <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-muted)', paddingTop: 10, borderTop: '1px solid var(--border-color)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Star size={14} fill="#f59e0b" color="#f59e0b" /> {hotel.starRating || 4} Star
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Bed size={14} /> {hotel.roomsCount || 0} Rooms
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Hash size={13} /> {hotel.registrationNumber || 'NTN Pending'}
            </span>
          </div>
        </div>

        {/* Suspension notice if suspended */}
        {hotel.status === 'SUSPENDED' && (
          <div style={{ padding: 14, borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', gap: 10 }}>
            <ShieldAlert size={18} color="#ef4444" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>Hotel Suspended</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {hotel.suspensionReason || 'Violation of SaaS terms of service or overdue verification.'}
              </div>
            </div>
          </div>
        )}

        {/* Manager Details */}
        <div className="card" style={{ padding: 16 }}>
          <h4 style={{ margin: '0 0 12px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Assigned General Manager
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Name:</span>
              <strong>{hotel.managerName || 'Unassigned'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Email:</span>
              <span>{hotel.managerEmail || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Phone:</span>
              <span>{hotel.managerPhone || '—'}</span>
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="card" style={{ padding: 16 }}>
          <h4 style={{ margin: '0 0 12px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Hotel Contact & Address
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Mail size={15} color="var(--text-muted)" />
              <span>{hotel.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Phone size={15} color="var(--text-muted)" />
              <span>{hotel.phone}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <MapPin size={15} color="var(--text-muted)" />
              <span>{hotel.address || `${hotel.city}, Pakistan`}</span>
            </div>
          </div>
        </div>

        {/* Amenities */}
        {hotel.amenities && (
          <div className="card" style={{ padding: 16 }}>
            <h4 style={{ margin: '0 0 12px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Facilities & Amenities
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {hotel.amenities.map((item, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: 12,
                    padding: '4px 10px',
                    borderRadius: 6,
                    background: 'var(--bg-card-hover)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, paddingTop: 10 }}>
          {hotel.status === 'PENDING' && onApprove && (
            <button
              onClick={() => onApprove(hotel)}
              className="btn btn-primary"
              style={{ flex: 1, background: '#10b981', borderColor: '#10b981' }}
            >
              Approve Hotel
            </button>
          )}

          {hotel.status === 'SUSPENDED' && onActivate && (
            <button
              onClick={() => onActivate(hotel)}
              className="btn btn-primary"
              style={{ flex: 1, background: '#10b981', borderColor: '#10b981' }}
            >
              Reactivate Hotel
            </button>
          )}

          {hotel.status !== 'SUSPENDED' && onSuspend && (
            <button
              onClick={() => onSuspend(hotel)}
              className="btn"
              style={{ flex: 1, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              Suspend Hotel
            </button>
          )}
        </div>
      </div>
    </Drawer>
  );
}
