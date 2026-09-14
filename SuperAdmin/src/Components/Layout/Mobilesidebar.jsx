import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useSuperAdmin } from '../../Context/SuperAdminContext.jsx';
import Sidebar from './Sidebar.jsx';

export default function MobileSidebar() {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useSuperAdmin();

  // Close on outside click / escape
  useEffect(() => {
    if (!mobileSidebarOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setMobileSidebarOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileSidebarOpen, setMobileSidebarOpen]);

  if (!mobileSidebarOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={() => setMobileSidebarOpen(false)}
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 49,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(2px)',
          animation: 'fadeIn 200ms ease',
        }}
      />
      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50,
        animation: 'slideInLeft 300ms cubic-bezier(0.4,0,0.2,1)',
      }}>
        <button
          onClick={() => setMobileSidebarOpen(false)}
          aria-label="Close menu"
          style={{
            position: 'absolute', top: 16, right: -44, zIndex: 51,
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--sidebar-bg)',
            border: '1px solid var(--sidebar-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>
        <Sidebar />
      </div>
    </>
  );
}
