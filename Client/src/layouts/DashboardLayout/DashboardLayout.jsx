import React, { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataProvider';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout({ children }) {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const { isDataLoaded } = useData();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-close mobile drawer on route navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (isLoading || (isAuthenticated && !isDataLoaded)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[var(--bg-default)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[var(--primary-main)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-gray-500">{isLoading ? 'Verifying session...' : 'Loading system data...'}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans bg-[var(--bg-default)] text-[var(--text-primary)]">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden animate-fade-in"
        />
      )}

      {/* Sidebar - Desktop static & Mobile drawer */}
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Topbar */}
        <Topbar onMobileNavToggle={() => setMobileOpen((prev) => !prev)} />

        {/* Page Content Wrapper */}
        <div className="flex-1 min-h-0 px-1.5 sm:px-2.5 pb-1 overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
