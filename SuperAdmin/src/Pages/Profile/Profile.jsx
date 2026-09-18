import PageHeader from '../../Components/Common/pageHeader.jsx';
import { useSuperAdmin } from '../../Context/SuperAdminContext.jsx';
import { User, Mail, Shield, Key, Building2 } from 'lucide-react';

export default function Profile() {
  const { user } = useSuperAdmin();

  const infoRow = (icon, label, value) => {
    const Icon = icon;
    return (
      <div className="sa-info-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon size={14} style={{ color: 'var(--color-text-muted)' }} />
          <span className="sa-info-label">{label}</span>
        </div>
        <span className="sa-info-value">{value || '—'}</span>
      </div>
    );
  };

  return (
    <div className="animate-fadein">
      <PageHeader title="Profile" subtitle="Your Super Admin account details." />
      <div style={{ maxWidth: 560 }}>
        <div className="sa-card">
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 24, fontWeight: 800, flexShrink: 0 }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{user?.name || 'Super Admin'}</h3>
              <div style={{ marginTop: 4 }}>
                <span className="badge badge-primary">Super Administrator</span>
              </div>
            </div>
          </div>

          <div className="sa-section-title" style={{ marginBottom: 12 }}>Account Information</div>
          {infoRow(User,     'Full Name',   user?.name || 'Super Admin')}
          {infoRow(Mail,     'Email',       user?.email || 'superadmin@explorepakistan.com')}
          {infoRow(Shield,   'Role',        'Super Administrator')}
          {infoRow(Building2,'Platform',    'Explore Pakistan Hotel Management')}

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
            <div className="sa-section-title" style={{ marginBottom: 12 }}>Security</div>
            <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Key size={15} /> Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
