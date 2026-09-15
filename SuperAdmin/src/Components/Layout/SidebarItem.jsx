import { NavLink } from 'react-router-dom';

export default function SidebarItem({
  to,
  icon: Icon,
  label,
  badge,
  collapsed = false,
  onClick,
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      title={collapsed ? label : undefined}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: collapsed ? '10px 8px' : '9px 12px',
        borderRadius: 8,
        marginBottom: 2,
        color: isActive ? '#fff' : 'var(--sidebar-text)',
        background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
        fontSize: 13,
        fontWeight: isActive ? 600 : 500,
        textDecoration: 'none',
        transition: 'background var(--transition-fast)',
        justifyContent: collapsed ? 'center' : 'space-between',
        borderLeft: isActive && !collapsed ? '2px solid var(--sidebar-active-border)' : '2px solid transparent',
      })}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {Icon && <Icon size={17} style={{ flexShrink: 0 }} />}
        {!collapsed && <span>{label}</span>}
      </div>

      {!collapsed && badge > 0 && (
        <span
          style={{
            background: '#ef4444',
            color: '#fff',
            fontSize: 10,
            fontWeight: 700,
            borderRadius: 99,
            padding: '1px 6px',
          }}
        >
          {badge}
        </span>
      )}
    </NavLink>
  );
}
