import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AppBreadcrumbs from './AppBreadcrumbs';

export default function DashboardLayout({ children }) {
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
        <div className="flex-1 min-h-0 px-3 md:px-4 pt-1 pb-3 md:pt-2 md:pb-4 overflow-y-auto overflow-x-hidden">
          <div className="-mb-3">
            <AppBreadcrumbs />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
