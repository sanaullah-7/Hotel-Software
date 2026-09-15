/**
 * Page header with title, subtitle, and action slot.
 */
export default function PageHeader({ title, subtitle, actions, className = '' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }} className={className}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 13.5, color: 'var(--color-text-muted)', marginTop: 4 }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  );
}
