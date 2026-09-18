import { AlertTriangle } from 'lucide-react';
import Modal from './Model.jsx';

/**
 * Confirmation modal for destructive actions.
 * @param {{ open: boolean, onClose: ()=>void, onConfirm: ()=>void, title: string, message: string, confirmLabel?: string, confirmVariant?: string, loading?: boolean, children?: React.ReactNode }} props
 */
export default function ConfirmModal({
  open, isOpen, onClose, onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel,
  confirmText,
  confirmVariant,
  isDestructive,
  loading = false,
  children,
}) {
  const isVisible = Boolean(open ?? isOpen);
  const btnLabel = confirmLabel || confirmText || 'Confirm';
  const btnVariant = confirmVariant || (isDestructive ? 'btn-danger' : 'btn-primary');
  return (
    <Modal open={isVisible} onClose={onClose} title={title} maxWidth={440}>
      <div className="sa-modal-body">
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--color-error-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={20} style={{ color: 'var(--color-error)' }} />
          </div>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>{message}</p>
        </div>
        {children}
      </div>
      <div className="sa-modal-footer">
        <button onClick={onClose} className="btn btn-secondary" disabled={loading}>Cancel</button>
        <button onClick={onConfirm} className={`btn ${btnVariant}`} disabled={loading}>
          {loading ? 'Please wait…' : btnLabel}
        </button>
      </div>
    </Modal>
  );
}
