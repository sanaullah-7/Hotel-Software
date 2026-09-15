/**
 * Empty state with icon, title, description, and optional action.
 */
export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', textAlign: 'center' }}>
      {Icon && (
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Icon size={28} style={{ color: 'var(--color-primary)' }} />
        </div>
      )}
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{title}</h3>
      {description && <p style={{ fontSize: 13.5, color: 'var(--color-text-muted)', maxWidth: 340, lineHeight: 1.6, marginBottom: action ? 24 : 0 }}>{description}</p>}
      {action && action}
    </div>
  );
}
