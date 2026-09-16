import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout/DashboardLayout';
import Dashboard from '../pages/Dashboard/Dashboard';

// Front Office Module Pages
import OperationsAlerts from '../pages/FrontOffice/OperationsAlerts';
import CheckInOut from '../pages/FrontOffice/CheckInOut';
import RegistrationForms from '../pages/FrontOffice/RegistrationForms';
import NewRegistrationForm from '../pages/FrontOffice/NewRegistrationForm';
import GuestComplaint from '../pages/FrontOffice/GuestComplaint';

// Reservation Module Pages
import AddReservation from '../pages/Reservation/AddReservation';
import AllReservations from '../pages/Reservation/AllReservations';
import ReservationHistory from '../pages/Reservation/ReservationHistory';

// Rooms Module Pages
import Rooms from '../pages/Rooms/Rooms';
import AddRoom from '../pages/Rooms/AddRoom';

// Housekeeping Module Pages
import RoomsAndCleaning from '../pages/Housekeeping/RoomsAndCleaning';
import Inspection from '../pages/Housekeeping/Inspection';
import StaffAssignment from '../pages/Housekeeping/StaffAssignment';

// Restaurant Module Pages
import Restaurant from '../pages/Restaurant/Restaurant';

// Assistant Module
import LuxuriaAssistant from '../pages/Assistant/LuxuriaAssistant';

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
        {/* Front Office Sub-Routes */}
        <Route 
          path="/front-office" 
          element={
            <DashboardLayout>
              <OperationsAlerts />
            </DashboardLayout>
          } 
        />
        <Route 
          path="/front-office/operations-alerts" 
          element={
            <DashboardLayout>
              <OperationsAlerts />
            </DashboardLayout>
          } 
        />
        <Route 
          path="/front-office/check-in-out" 
          element={
            <DashboardLayout>
              <CheckInOut />
            </DashboardLayout>
          } 
        />
        <Route 
          path="/front-office/registration-forms" 
          element={
            <DashboardLayout>
              <RegistrationForms />
            </DashboardLayout>
          } 
        />
        <Route 
          path="/front-office/registration-forms/new" 
          element={
            <DashboardLayout>
              <NewRegistrationForm />
            </DashboardLayout>
          } 
        />
        <Route 
          path="/front-office/guest-complaint" 
          element={
            <DashboardLayout>
              <GuestComplaint />
            </DashboardLayout>
          } 
        />

        {/* Reservation Sub-Routes */}
        <Route 
          path="/reservation" 
          element={<Navigate to="/reservation/new" replace />} 
        />
        <Route 
          path="/reservation/new" 
          element={
            <DashboardLayout>
              <AddReservation />
            </DashboardLayout>
          } 
        />
        <Route 
          path="/reservation/all" 
          element={
            <DashboardLayout>
              <AllReservations />
            </DashboardLayout>
          } 
        />
        <Route 
          path="/reservation/history" 
          element={
            <DashboardLayout>
              <ReservationHistory />
            </DashboardLayout>
          } 
        />
        {/* Rooms Sub-Routes */}
        <Route 
          path="/rooms" 
          element={
            <DashboardLayout>
              <Rooms />
            </DashboardLayout>
          } 
        />
        <Route 
          path="/rooms/new" 
          element={
            <DashboardLayout>
              <AddRoom />
            </DashboardLayout>
          } 
        />

        {/* Housekeeping Sub-Routes */}
        <Route 
          path="/housekeeping" 
          element={<Navigate to="/housekeeping/rooms-cleaning" replace />} 
        />
        <Route 
          path="/housekeeping/rooms-cleaning" 
          element={
            <DashboardLayout>
              <RoomsAndCleaning />
            </DashboardLayout>
          } 
        />
        <Route 
          path="/housekeeping/inspection" 
          element={
            <DashboardLayout>
              <Inspection />
            </DashboardLayout>
          } 
        />
        <Route 
          path="/housekeeping/staff-assignment" 
          element={
            <DashboardLayout>
              <StaffAssignment />
            </DashboardLayout>
          } 
        />

        {/* Restaurant Sub-Routes */}
        <Route
          path="/restaurant"
          element={<Navigate to="/restaurant/menu" replace />}
        />
        <Route
          path="/restaurant/menu"
          element={
            <DashboardLayout>
              <Restaurant />
            </DashboardLayout>
          }
        />
        <Route
          path="/restaurant/orders"
          element={
            <DashboardLayout>
              <Restaurant />
            </DashboardLayout>
          }
        />
        {/* Assistant Route */}
        <Route
          path="/ai-assistant"
          element={
            <DashboardLayout>
              <LuxuriaAssistant />
            </DashboardLayout>
          }
        />
      </Routes>
    </Router>
  );
}