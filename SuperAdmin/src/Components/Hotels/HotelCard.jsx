import HotelStatusBadge from './HotelStatusBadge.jsx';
import {  MapPin, Phone, Mail, Star, Bed } from 'lucide-react';

export default function HotelCard({ hotel, onView }) {
  return (
    <div className="card hover-lift" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h4 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>{hotel.name}</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
            <MapPin size={13} /> {hotel.city}, Pakistan
          </div>
        </div>
        <HotelStatusBadge status={hotel.status} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Star size={14} fill="#f59e0b" color="#f59e0b" /> {hotel.starRating || 4} Stars
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Bed size={14} /> {hotel.roomsCount || 0} Rooms
        </span>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
          <Mail size={13} /> {hotel.email}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
          <Phone size={13} /> {hotel.phone}
        </div>
      </div>

      {onView && (
        <button
          onClick={() => onView(hotel)}
          style={{
            marginTop: 4,
            width: '100%',
            padding: '8px',
            borderRadius: 8,
            background: 'var(--bg-card-hover)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          View Hotel Profile
        </button>
      )}
    </div>
  );
}
