import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout({ children }) {
  const location = useLocation();
  const isMinimizedPadding =
    location.pathname.startsWith('/events') ||
    location.pathname.startsWith('/settings') ||
    location.pathname.startsWith('/hotel-settings') ||
    location.pathname.startsWith('/reports');

  return (
    <div 
      className="flex h-screen w-full overflow-hidden font-sans bg-[var(--bg-default)] text-[var(--text-primary)]"
    >
      {/* Static Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full">
        {/* Topbar */}
        <Topbar />
        
        {/* Page Content Wrapper */}
        <div className="flex-1 min-h-0 px-1.5 pb-2 overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
