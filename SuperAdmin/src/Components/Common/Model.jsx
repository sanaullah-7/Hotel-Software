import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

/**
 * Accessible modal dialog.
 * @param {{ open: boolean, onClose: ()=>void, title: string, children: React.ReactNode, maxWidth?: number }} props
 */
export default function Modal({ open, isOpen, onClose, title, children, maxWidth = 520 }) {
  const isVisible = Boolean(open ?? isOpen);

  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isVisible) return;
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isVisible, handleKey]);

  if (!isVisible) return null;

  return (
    <div className="sa-overlay" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sa-modal" style={{ maxWidth }} onClick={(e) => e.stopPropagation()}>
        <div className="sa-modal-header">
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{title}</h2>
          <button onClick={onClose} aria-label="Close modal" className="btn btn-ghost btn-icon" style={{ padding: 6 }}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
