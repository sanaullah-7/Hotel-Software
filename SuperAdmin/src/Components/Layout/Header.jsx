import { useLocation, Link } from 'react-router-dom';
import { Bell, Sun, Moon, Menu, Search, ChevronRight } from 'lucide-react';
import { useSuperAdmin } from '../../Context/SuperAdminContext.jsx';

// Map pathname segments to readable labels
const PATH_LABELS = {
  dashboard:    'Dashboard',
  hotels:       'Hotels',
  pending:      'Pending Approvals',
  users:        'Users',
  managers:     'Managers',
  receptionists:'Receptionists',
  approvals:    'Approvals',
  approved:     'Approved',
  rejected:     'Rejected',
  subscriptions:'Subscriptions',
  plans:        'Plans',
  revenue:      'Revenue',
  reports:      'Reports',
  notifications:'Notifications',
  'audit-logs': 'Audit Logs',
  settings:     'Settings',
  profile:      'Profile',
  support:      'Support',
};

function Breadcrumb() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <Link to="/dashboard" style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Home</Link>
      {segments.map((seg, i) => {
        const label = PATH_LABELS[seg] || (seg.length === 24 ? 'Detail' : seg);
        const isLast = i === segments.length - 1;
        const to = '/' + segments.slice(0, i + 1).join('/');
        return (
          <span key={to} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ChevronRight size={13} style={{ color: 'var(--color-text-muted)' }} />
            {isLast ? (
              <span style={{ color: 'var(--color-text-primary)', fontSize: 13, fontWeight: 600 }}>{label}</span>
            ) : (
              <Link to={to} style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>{label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export default function Header() {
  const { theme, toggleTheme, unreadCount, toggleMobileSidebar } = useSuperAdmin();
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);
  const currentPage = PATH_LABELS[segments[segments.length - 1]] || 'Dashboard';

  const iconBtn = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 36, height: 36, borderRadius: 8,
    background: 'var(--color-surface-2)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer', transition: 'all var(--transition-fast)',
    flexShrink: 0,
  };

  return (
    <header className="sa-topbar">
      {/* Mobile hamburger */}
      <button
        onClick={toggleMobileSidebar}
        aria-label="Toggle sidebar"
        style={{ ...iconBtn, display: 'none' }}
        className="mobile-menu-btn"
      >
        <Menu size={18} />
      </button>

      {/* Page title + breadcrumb */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
          {currentPage}
        </h1>
        <div style={{ marginTop: 2 }}>
          <Breadcrumb />
        </div>
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          style={iconBtn}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications */}
        <Link
          to="/notifications"
          style={{ ...iconBtn, position: 'relative', textDecoration: 'none' }}
          aria-label={`Notifications${unreadCount > 0 ? ` — ${unreadCount} unread` : ''}`}
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: 4, right: 4,
              width: 8, height: 8, borderRadius: '50%',
              background: '#ef4444',
              border: '2px solid var(--color-surface)',
            }} />
          )}
        </Link>

        {/* Avatar */}
        <Link
          to="/profile"
          aria-label="Profile"
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none',
            flexShrink: 0, border: '2px solid var(--color-border)',
          }}
        >
          S
        </Link>
      </div>

      {/* Mobile header CSS */}
      <style>{`
        @media (max-width: 1024px) {
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
