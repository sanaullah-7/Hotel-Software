import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout/DashboardLayout';
import Dashboard from '../pages/Dashboard/Dashboard';

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Main Dashboard Route wrapped in our Layout */}
        <Route 
          path="/" 
          element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          } 
        />
        
        {/* We will add more routes here for /bookings, /rooms, etc. */}
      </Routes>
    </Router>
  );
}