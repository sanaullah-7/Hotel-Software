import { useState } from 'react';
import Model from '../Common/Model.jsx';
import { AlertTriangle } from 'lucide-react';

export default function HotelSuspenModel({
  isOpen,
  onClose,
  onConfirm,
  hotel,
}) {
  const [reason, setReason] = useState('');

  if (!hotel) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onConfirm) onConfirm(hotel.id, reason);
    setReason('');
    onClose();
  };

  return (
    <Model isOpen={isOpen} onClose={onClose} title="Suspend Hotel Account">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <AlertTriangle size={24} color="#ef4444" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: 13, color: '#ef4444', lineHeight: 1.4 }}>
            Warning: Suspending <strong>{hotel.name}</strong> will immediately disable customer bookings and restrict receptionist access.
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            Suspension Reason / Violation Details
          </label>
          <textarea
            required
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Specify reason for suspension (e.g., license expiration, customer complaints, payment default)..."
            className="search-input"
            style={{ width: '100%', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
          <button
            type="button"
            onClick={onClose}
            className="btn"
            style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn"
            style={{ background: '#ef4444', color: '#fff', border: '1px solid #ef4444' }}
          >
            Confirm Suspension
          </button>
        </div>
      </form>
    </Model>
  );
}
