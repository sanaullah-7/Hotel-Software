import { Loader2 } from 'lucide-react';

/**
 * Full-area loading spinner.
 * @param {{ message?: string }} props
 */
export default function LoadingState({ message = 'Loading…' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', gap: 16 }}>
      <Loader2 size={32} style={{ color: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
      <p style={{ fontSize: 13.5, color: 'var(--color-text-muted)' }}>{message}</p>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
