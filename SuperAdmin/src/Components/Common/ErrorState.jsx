import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Error state with retry.
 */
export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-error-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <AlertCircle size={28} style={{ color: 'var(--color-error)' }} />
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Unable to load data</h3>
      <p style={{ fontSize: 13.5, color: 'var(--color-text-muted)', maxWidth: 340, lineHeight: 1.6, marginBottom: 24 }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={15} /> Try Again
        </button>
      )}
    </div>
  );
}
