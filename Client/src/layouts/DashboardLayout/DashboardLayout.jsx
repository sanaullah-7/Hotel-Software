import Sidebar from './Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div 
      className="flex h-screen w-full overflow-hidden font-sans bg-[var(--bg-default)] text-[var(--text-primary)]"
    >
      {/* Static Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full">
        {/* We can add a Topbar here in the future */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
