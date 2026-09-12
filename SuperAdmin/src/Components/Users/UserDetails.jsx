import Drawer from '../Common/Drawer.jsx';
import StatusBadge from '../Common/StatusBadge.jsx';
import { User, Mail, Phone, Building2, Calendar, Clock, Shield } from 'lucide-react';
import { formatDate } from '../../utils/ForamteDate.js';

export default function UserDetails({ user, isOpen, onClose }) {
  if (!user) return null;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="User Profile">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* User Card Header */}
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
            {user.name?.charAt(0)?.toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600 }}>{user.name}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 6,
                  background: 'rgba(99,102,241,0.15)',
                  color: '#6366f1',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                {user.role}
              </span>
              <StatusBadge status={user.status} />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card" style={{ padding: 16 }}>
          <h4 style={{ margin: '0 0 12px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Contact & Hotel Details
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
              <Mail size={15} color="var(--text-muted)" />
              <span style={{ color: 'var(--text-muted)', width: 60 }}>Email:</span>
              <span style={{ fontWeight: 500 }}>{user.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
              <Phone size={15} color="var(--text-muted)" />
              <span style={{ color: 'var(--text-muted)', width: 60 }}>Phone:</span>
              <span style={{ fontWeight: 500 }}>{user.phone || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
              <Building2 size={15} color="var(--text-muted)" />
              <span style={{ color: 'var(--text-muted)', width: 60 }}>Hotel:</span>
              <span style={{ fontWeight: 600, color: 'var(--accent-purple)' }}>{user.hotelName || 'Unassigned'}</span>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="card" style={{ padding: 16 }}>
          <h4 style={{ margin: '0 0 12px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Account Metadata
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
              <Calendar size={15} color="var(--text-muted)" />
              <span style={{ color: 'var(--text-muted)', width: 90 }}>Registered:</span>
              <span>{formatDate(user.createdAt)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
              <Clock size={15} color="var(--text-muted)" />
              <span style={{ color: 'var(--text-muted)', width: 90 }}>Last Login:</span>
              <span>{user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
              <Shield size={15} color="var(--text-muted)" />
              <span style={{ color: 'var(--text-muted)', width: 90 }}>User ID:</span>
              <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{user.id}</span>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
