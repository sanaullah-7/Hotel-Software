import { useSuperAdmin } from '../../Context/SuperAdminContext.jsx';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ICONS = {
  success: CheckCircle,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
};

const COLORS = {
  success: 'var(--color-success)',
  error:   'var(--color-error)',
  warning: 'var(--color-warning)',
  info:    'var(--color-info)',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useSuperAdmin();

  return (
    <div className="sa-toast-container">
      {toasts.map((t) => {
        const Icon = ICONS[t.type] || Info;
        const color = COLORS[t.type] || 'var(--color-info)';
        return (
          <div key={t.id} className="sa-toast">
            <Icon size={18} style={{ color, flexShrink: 0, marginTop: 1 }} />
            <span style={{ flex: 1, color: 'var(--color-text-primary)', fontSize: 13 }}>{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              aria-label="Dismiss"
              style={{ color: 'var(--color-text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', flexShrink: 0 }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
