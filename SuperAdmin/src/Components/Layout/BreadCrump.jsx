import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_NAMES = {
  dashboard: 'Dashboard',
  hotels: 'Hotels',
  pending: 'Pending Approvals',
  users: 'Users',
  managers: 'Managers',
  receptionists: 'Receptionists',
  approvals: 'Approvals',
  approved: 'Approved Requests',
  rejected: 'Rejected Requests',
  subscriptions: 'Subscriptions',
  plans: 'Plans',
  revenue: 'Revenue',
  reports: 'Reports',
  'audit-logs': 'Audit Logs',
  notifications: 'Notifications',
  support: 'Support',
  settings: 'Settings',
  profile: 'Profile',
};

export default function BreadCrump() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  if (!pathSegments.length || (pathSegments.length === 1 && pathSegments[0] === 'dashboard')) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
        <Home size={14} />
        <span>Dashboard</span>
      </div>
    );
  }

  return (
    <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
      <Link
        to="/dashboard"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          color: 'var(--text-muted)',
          textDecoration: 'none',
        }}
      >
        <Home size={14} />
        <span>Home</span>
      </Link>

      {pathSegments.map((seg, idx) => {
        const isLast = idx === pathSegments.length - 1;
        const url = `/${pathSegments.slice(0, idx + 1).join('/')}`;
        const name = ROUTE_NAMES[seg.toLowerCase()] || seg.charAt(0).toUpperCase() + seg.slice(1);

        return (
          <div key={url} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ChevronRight size={13} color="var(--text-muted)" />
            {isLast ? (
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{name}</span>
            ) : (
              <Link
                to={url}
                style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
              >
                {name}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
