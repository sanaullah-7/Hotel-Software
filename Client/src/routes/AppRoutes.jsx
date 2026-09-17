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
import EditReservation from '../pages/Reservation/EditReservation';
import CancelledBookings from '../pages/Reservation/CancelledBookings';
import GroupReservations from '../pages/Reservation/GroupReservations';
// Rooms Module Pages
import Rooms from '../pages/Rooms/Rooms';
import RoomTypes from '../pages/Rooms/RoomTypes';
import RatePricing from '../pages/Rooms/RatePricing';
import AddRoom from '../pages/Rooms/AddRoom';

// Housekeeping Module Pages
import RoomsAndCleaning from '../pages/Housekeeping/RoomsAndCleaning';
import CleaningSchedule from '../pages/Housekeeping/CleaningSchedule';
import LostAndFound from '../pages/Housekeeping/LostAndFound';
import InspectionChecklist from '../pages/Housekeeping/InspectionChecklist';

// Guests Module
import Guests from '../pages/Guests/Guests';

// Occupancy Module
import Occupancy from '../pages/Occupancy/Occupancy';

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
            path="/reservation/edit" 
            element={
              <DashboardLayout>
                <EditReservation />
              </DashboardLayout>
            } 
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
            path="/reservation/cancelled" 
            element={
              <DashboardLayout>
                <CancelledBookings />
              </DashboardLayout>
            } 
          />
                    <Route 
            path="/reservation/group" 
            element={
              <DashboardLayout>
                <GroupReservations />
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
          path="/rooms/room-types" 
          element={
            <DashboardLayout>
              <RoomTypes />
            </DashboardLayout>
          } 
        />
        <Route 
          path="/rooms/rate-pricing" 
          element={
            <DashboardLayout>
              <RatePricing />
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
          path="/housekeeping/cleaning-schedule" 
          element={
            <DashboardLayout>
              <CleaningSchedule />
            </DashboardLayout>
          } 
        />

        <Route 
          path="/housekeeping/lost-and-found" 
          element={
            <DashboardLayout>
              <LostAndFound />
            </DashboardLayout>
          } 
        />

        <Route 
          path="/housekeeping/inspection-checklist" 
          element={
            <DashboardLayout>
              <InspectionChecklist />
            </DashboardLayout>
          } 
        />

        {/* Guests Sub-Routes */}
        <Route 
          path="/guests" 
          element={
            <DashboardLayout>
              <Guests />
            </DashboardLayout>
          } 
        />

        {/* Occupancy Sub-Routes */}
        <Route 
          path="/occupancy" 
          element={
            <DashboardLayout>
              <Occupancy />
            </DashboardLayout>
          } 
        />
      </Routes>
    </Router>
  );
}








