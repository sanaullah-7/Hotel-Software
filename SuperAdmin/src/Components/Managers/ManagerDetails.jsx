import Drawer from '../Common/Drawer.jsx';
import StatusBadge from '../Common/StatusBadge.jsx';
import { Mail, Phone, Building2, Calendar, Clock, Shield } from 'lucide-react';
import { formatDate } from '../../utils/ForamteDate.js';

export default function ManagerDetails({ manager, isOpen, onClose }) {
  if (!manager) return null;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Manager Profile">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: 16,
            borderRadius: 12,
            background: 'var(--bg-card-hover)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            {manager.name?.charAt(0)?.toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600 }}>{manager.name}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 6,
                  background: 'rgba(99,102,241,0.15)',
                  color: '#6366f1',
                  fontWeight: 600,
                }}
              >
                Hotel General Manager
              </span>
              <StatusBadge status={manager.status} />
            </div>
          </div>
        </div>

        {/* Assigned Hotel Details */}
        <div className="card" style={{ padding: 16 }}>
          <h4 style={{ margin: '0 0 12px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Associated Hotel
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
            <Building2 size={16} color="var(--accent-purple)" />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {manager.hotelName || 'No Hotel Assigned'}
            </span>
          </div>
        </div>

        {/* Contact info */}
        <div className="card" style={{ padding: 16 }}>
          <h4 style={{ margin: '0 0 12px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Contact Information
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
              <Mail size={15} color="var(--text-muted)" />
              <span style={{ color: 'var(--text-muted)', width: 60 }}>Email:</span>
              <span style={{ fontWeight: 500 }}>{manager.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
              <Phone size={15} color="var(--text-muted)" />
              <span style={{ color: 'var(--text-muted)', width: 60 }}>Phone:</span>
              <span style={{ fontWeight: 500 }}>{manager.phone || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Activity & dates */}
        <div className="card" style={{ padding: 16 }}>
          <h4 style={{ margin: '0 0 12px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Activity & System Info
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
              <Calendar size={15} color="var(--text-muted)" />
              <span style={{ color: 'var(--text-muted)', width: 90 }}>Registered:</span>
              <span>{formatDate(manager.createdAt)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
              <Clock size={15} color="var(--text-muted)" />
              <span style={{ color: 'var(--text-muted)', width: 90 }}>Last Login:</span>
              <span>{manager.lastLogin ? formatDate(manager.lastLogin) : 'Never'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
              <Shield size={15} color="var(--text-muted)" />
              <span style={{ color: 'var(--text-muted)', width: 90 }}>Manager ID:</span>
              <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{manager.id}</span>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
