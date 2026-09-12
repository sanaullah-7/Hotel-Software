import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Hotel, Users, CheckSquare, CreditCard,
  DollarSign, BarChart2, Bell, Shield, Settings, ChevronRight,
  LogOut, User, MessageSquare, Activity, ChevronLeft, ChevronDown,
  ChevronUp, Building2
} from 'lucide-react';
import { useSuperAdmin } from '../../Context/SuperAdminContext.jsx';
import { useState } from 'react';

// =============================================================================
// Navigation configuration
// =============================================================================
const NAV = [
  {
    section: 'Main',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
    ],
  },
  {
    section: 'Hotels',
    items: [
      {
        label: 'Hotels',
        icon: Hotel,
        children: [
          { label: 'All Hotels', to: '/hotels' },
          { label: 'Pending Approvals', to: '/hotels/pending', badge: 'pending' },
        ],
      },
    ],
  },
  {
    section: 'People',
    items: [
      {
        label: 'Users',
        icon: Users,
        children: [
          { label: 'All Users', to: '/users' },
          { label: 'Managers', to: '/users/managers' },
          { label: 'Receptionists', to: '/users/receptionists' },
        ],
      },
    ],
  },
  {
    section: 'Operations',
    items: [
      {
        label: 'Approvals',
        icon: CheckSquare,
        children: [
          { label: 'All Requests', to: '/approvals' },
          { label: 'Pending', to: '/approvals/pending', badge: 'pending' },
          { label: 'Approved', to: '/approvals/approved' },
          { label: 'Rejected', to: '/approvals/rejected' },
        ],
      },
      {
        label: 'Subscriptions',
        icon: CreditCard,
        children: [
          { label: 'Overview', to: '/subscriptions' },
          { label: 'Plans', to: '/subscriptions/plans' },
        ],
      },
      {
        label: 'Revenue',
        icon: DollarSign,
        children: [
          { label: 'Overview', to: '/revenue' },
          { label: 'Transactions', to: '/revenue/transactions' },
        ],
      },
    ],
  },
  {
    section: 'Analytics',
    items: [
      {
        label: 'Reports',
        icon: BarChart2,
        children: [
          { label: 'Overview', to: '/reports' },
          { label: 'Hotel Analytics', to: '/reports/hotels' },
          { label: 'Revenue Financials', to: '/reports/revenue' },
          { label: 'Staff Demographics', to: '/reports/users' },
        ],
      },
      { label: 'Audit Logs', icon: Shield, to: '/audit-logs' },
    ],
  },
  {
    section: 'System',
    items: [
      { label: 'Notifications', icon: Bell, to: '/notifications', badge: 'notifications' },
      { label: 'Support & Tickets', icon: MessageSquare, to: '/support' },
      { label: 'Settings', icon: Settings, to: '/settings' },
    ],
  },
];

// =============================================================================
// Sidebar Component
// =============================================================================
export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, unreadCount, logout, user, setMobileSidebarOpen } = useSuperAdmin();
  const location = useLocation();

  // track expanded sub-menus
  const [expanded, setExpanded] = useState(() => {
    const open = {};
    NAV.forEach((section) => section.items.forEach((item) => {
      if (item.children?.some((c) => location.pathname.startsWith(c.to))) {
        open[item.label] = true;
      }
    }));
    return open;
  });

  const toggleExpand = (label) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside className={`sa-sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: sidebarCollapsed ? '8px 16px' : '8px 20px', borderBottom: '1px solid var(--sidebar-border)', minHeight: 'var(--topbar-height)' }}>
        {!sidebarCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Building2 size={18} color="#fff" />
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>Explore Pakistan</div>
              <div style={{ color: 'var(--sidebar-text)', fontSize: 10, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Super Admin</div>
            </div>
          </div>
        )}
        {sidebarCollapsed && (
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <Building2 size={18} color="#fff" />
          </div>
        )}
        {!sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            aria-label="Collapse sidebar"
            style={{ color: 'var(--sidebar-text)', padding: 4, borderRadius: 6, cursor: 'pointer', background: 'transparent', border: 'none', display: 'flex', flexShrink: 0 }}
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {sidebarCollapsed && (
        <button
          onClick={toggleSidebar}
          aria-label="Expand sidebar"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '8px', color: 'var(--sidebar-text)', background: 'transparent', border: 'none', cursor: 'pointer', borderBottom: '1px solid var(--sidebar-border)' }}
        >
          <ChevronRight size={16} />
        </button>
      )}

      {/* Navigation */}
      <nav className="sa-sidebar-nav" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: sidebarCollapsed ? '12px 8px' : '12px 12px' }}>
        {NAV.map((section) => (
          <div key={section.section} style={{ marginBottom: 8 }}>
            {/* Section label */}
            {!sidebarCollapsed && (
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--sidebar-text)', padding: '8px 8px 4px', opacity: 0.6 }}>
                {section.section}
              </div>
            )}

            {section.items.map((item) => {
              if (item.children) {
                const isExpanded = expanded[item.label];
                const isActive = item.children.some((c) => location.pathname.startsWith(c.to));
                return (
                  <div key={item.label}>
                    <button
                      onClick={() => !sidebarCollapsed && toggleExpand(item.label)}
                      title={sidebarCollapsed ? item.label : undefined}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: sidebarCollapsed ? '10px 8px' : '9px 10px',
                        borderRadius: 8,
                        border: 'none',
                        cursor: 'pointer',
                        background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                        color: isActive ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                        fontSize: 13,
                        fontWeight: 500,
                        fontFamily: 'inherit',
                        transition: 'background var(--transition-fast)',
                        marginBottom: 2,
                        justifyContent: sidebarCollapsed ? 'center' : 'space-between',
                        borderLeft: isActive && !sidebarCollapsed ? '2px solid var(--sidebar-active-border)' : '2px solid transparent',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <item.icon size={17} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.75 }} />
                        {!sidebarCollapsed && <span>{item.label}</span>}
                      </span>
                      {!sidebarCollapsed && (isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </button>

                    {/* Sub-items */}
                    {isExpanded && !sidebarCollapsed && (
                      <div style={{ marginLeft: 16, borderLeft: '1px solid var(--sidebar-border)', paddingLeft: 12, marginBottom: 4 }}>
                        {item.children.map((child) => (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            end={child.to === '/hotels' || child.to === '/users' || child.to === '/approvals' || child.to === '/subscriptions' || child.to === '/revenue' || child.to === '/reports'}
                            onClick={() => setMobileSidebarOpen?.(false)}
                            style={({ isActive }) => ({
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '7px 10px', borderRadius: 6,
                              color: isActive ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                              background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                              fontSize: 12.5, fontWeight: isActive ? 600 : 400,
                              marginBottom: 2, transition: 'all var(--transition-fast)',
                            })}
                          >
                            <span>{child.label}</span>
                            {child.badge === 'pending' && unreadCount > 0 && (
                              <span style={{ background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 99, padding: '1px 6px', minWidth: 18, textAlign: 'center' }}>
                                {unreadCount}
                              </span>
                            )}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              // Leaf item
              const badge = item.badge === 'notifications' ? unreadCount : 0;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileSidebarOpen?.(false)}
                  title={sidebarCollapsed ? item.label : undefined}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: sidebarCollapsed ? '10px 8px' : '9px 10px',
                    borderRadius: 8, marginBottom: 2,
                    color: isActive ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                    background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                    fontSize: 13, fontWeight: 500,
                    transition: 'background var(--transition-fast)',
                    justifyContent: sidebarCollapsed ? 'center' : 'space-between',
                    borderLeft: isActive && !sidebarCollapsed ? '2px solid var(--sidebar-active-border)' : '2px solid transparent',
                  })}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <item.icon size={17} style={{ flexShrink: 0 }} />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </span>
                  {!sidebarCollapsed && badge > 0 && (
                    <span style={{ background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 99, padding: '1px 6px' }}>
                      {badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer — User info + logout */}
      <div style={{ borderTop: '1px solid var(--sidebar-border)', padding: sidebarCollapsed ? '6px 8px' : '6px 16px', flexShrink: 0, minHeight: 45, display: 'flex', alignItems: 'center' }}>
        {!sidebarCollapsed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff', fontWeight: 700, fontSize: 13 }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: 'var(--color-text-primary)', fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Super Admin'}</div>
              <div style={{ color: 'var(--sidebar-text)', fontSize: 11 }}>Administrator</div>
            </div>
            <button onClick={logout} aria-label="Logout" style={{ color: 'var(--sidebar-text)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}>
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button onClick={logout} aria-label="Logout" title="Logout" style={{ width: '100%', display: 'flex', justifyContent: 'center', color: 'var(--sidebar-text)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px 0', borderRadius: 8 }}>
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  );
}
