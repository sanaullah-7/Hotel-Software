import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

/**
 * Slide-in Drawer from the right.
 * @param {{ open: boolean, onClose: ()=>void, title: string, subtitle?: string, children: React.ReactNode, footer?: React.ReactNode, width?: number }} props
 */
export default function Drawer({ open, isOpen, onClose, title, subtitle, children, footer, width = 520 }) {
  const isVisible = Boolean(open ?? isOpen);

  const handleKey = useCallback((e) => { if (e.key === 'Escape') onClose(); }, [onClose]);

  useEffect(() => {
    if (!isVisible) return;
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleKey); document.body.style.overflow = ''; };
  }, [isVisible, handleKey]);

  if (!isVisible) return null;

  return (
    <>
      <div className="sa-drawer-overlay" onClick={onClose} aria-hidden="true" />
      <div className="sa-drawer" style={{ maxWidth: width }} role="dialog" aria-modal="true" aria-label={title}>
        <div className="sa-drawer-header">
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{title}</h2>
            {subtitle && <p style={{ fontSize: 12.5, color: 'var(--color-text-muted)', margin: '2px 0 0' }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Close drawer" className="btn btn-ghost btn-icon" style={{ padding: 6 }}>
            <X size={18} />
          </button>
        </div>
        <div className="sa-drawer-body">{children}</div>
        {footer && <div className="sa-drawer-footer">{footer}</div>}
      </div>
    </>
  );
}
