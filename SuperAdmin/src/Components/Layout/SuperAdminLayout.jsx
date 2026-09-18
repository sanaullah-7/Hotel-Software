import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import MobileSidebar from './Mobilesidebar.jsx';
import ToastContainer from '../Common/ToastContainer.jsx';

export default function SuperAdminLayout() {
  return (
    <div className="sa-shell">
      {/* Desktop Sidebar */}
      <div className="desktop-sidebar">
        <Sidebar />
      </div>

      {/* Mobile Sidebar overlay */}
      <MobileSidebar />

      {/* Main content area */}
      <div className="sa-main">
        <Header />
        <main className="sa-content">
          <Outlet />
        </main>
      </div>

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
}
