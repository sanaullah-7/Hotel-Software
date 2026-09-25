import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Auth/Login';
import AdminProfile from '../pages/Auth/AdminProfile';
import Register from '../pages/Auth/Register';
import DashboardLayout from '../layouts/DashboardLayout/DashboardLayout';
import Dashboard from '../pages/Dashboard/Dashboard';

// Front Office Module Pages
import OperationsAlerts from '../features/front-office/pages/OperationsAlerts';
import CheckInOut from '../features/front-office/pages/CheckInOut';
import RegistrationForms from '../features/front-office/pages/RegistrationForms';
import NewRegistrationForm from '../features/front-office/pages/NewRegistrationForm';
import GuestComplaint from '../features/front-office/pages/GuestComplaint';

// Reservation Module Pages
import AddReservation from '../features/reservations/pages/AddReservation';
import AllReservations from '../features/reservations/pages/AllReservations';
import ReservationHistory from '../features/reservations/pages/ReservationHistory';
import EditReservation from '../features/reservations/pages/EditReservation';
import CancelledBookings from '../features/reservations/pages/CancelledBookings';
import GroupReservations from '../features/reservations/pages/GroupReservations';

// Rooms Module Pages
import Rooms from '../features/rooms/pages/Rooms';
import AddRoom from '../features/rooms/pages/AddRoom';
import RoomTypes from '../features/rooms/pages/RoomTypes';
import RatePricing from '../features/rooms/pages/RatePricing';

// Housekeeping Module Pages
import RoomsAndCleaning from '../features/housekeeping/pages/RoomsAndCleaning';
import Inspection from '../features/housekeeping/pages/Inspection';
import StaffAssignment from '../features/housekeeping/pages/StaffAssignment';
import CleaningSchedule from '../features/housekeeping/pages/CleaningSchedule';
import LostAndFound from '../features/housekeeping/pages/LostAndFound';
import InspectionChecklist from '../features/housekeeping/pages/InspectionChecklist';

// Inventory Module Pages
import AllInventory from '../features/inventory/pages/AllInventory';
import GuestCharges from '../features/inventory/pages/GuestCharges';
import MissingInventory from '../features/inventory/pages/MissingInventory';

// Rates & Pricing Module Pages
import RatePlans from '../features/rates-pricing/pages/RatePlans';
import Discounts from '../features/rates-pricing/pages/Discounts';
import TaxesFees from '../features/rates-pricing/pages/TaxesFees';

// Payment & Billing Module Pages
import Invoices from '../features/payment-billing/pages/Invoices';
import PaymentHistory from '../features/payment-billing/pages/PaymentHistory';
import PendingPayments from '../features/payment-billing/pages/PendingPayments';
import Refunds from '../features/payment-billing/pages/Refunds';

// Guests Module
import Guests from '../features/guests/pages/Guests';
import GuestProfile from '../features/guests/pages/GuestProfile';

// Occupancy Module
import Occupancy from '../features/occupancy/pages/Occupancy';
import CarParking from '../features/car-parking/pages/CarParking';

// HR Module Pages
import AllStaff from '../features/staff/pages/AllStaff';
import AddStaff from '../features/staff/pages/AddStaff';
import EditStaff from '../features/staff/pages/EditStaff';
import StaffProfile from '../features/staff/pages/StaffProfile';
import LeaveRequests from '../features/staff/pages/LeaveRequests';
import AttendanceSheet from '../features/staff/pages/AttendanceSheet';
import TodaysAttendance from '../features/staff/pages/TodaysAttendance';
import EmployeeSalary from '../features/staff/pages/EmployeeSalary';

// Reports Module Pages
import ReportsPage from '../features/reports/pages/ReportsPage';

import AuditLog from '../features/audit/pages/AuditLog';
// Settings Module Pages
import HotelProfile from '../features/settings/pages/HotelProfile';
import Policies from '../features/settings/pages/Policies';

// Restaurant Module Pages
import Restaurant from '../features/restaurant/pages/Restaurant';

// Events & Banquets Module Pages
import BanquetManager from '../features/events/pages/BanquetManager';
import AllEvents from '../features/events/pages/AllEvents';
import AddEvent from '../features/events/pages/AddEvent';

// Assistant Module
import LuxuriaAssistant from '../features/assistant/pages/LuxuriaAssistant';

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Core & Auth Routes */}
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />

        {/* Front Office Sub-Routes */}
        <Route path="/front-office" element={<DashboardLayout><OperationsAlerts /></DashboardLayout>} />
        <Route path="/front-office/operations-alerts" element={<DashboardLayout><OperationsAlerts /></DashboardLayout>} />
        <Route path="/front-office/check-in-out" element={<DashboardLayout><CheckInOut /></DashboardLayout>} />
        <Route path="/front-office/registration-forms" element={<DashboardLayout><RegistrationForms /></DashboardLayout>} />
        <Route path="/front-office/registration-forms/new" element={<DashboardLayout><NewRegistrationForm /></DashboardLayout>} />
        <Route path="/front-office/guest-complaint" element={<DashboardLayout><GuestComplaint /></DashboardLayout>} />
        <Route path="/front-office/guest-complaints" element={<DashboardLayout><GuestComplaint /></DashboardLayout>} />

        {/* Reservation Sub-Routes */}
        <Route path="/reservation" element={<Navigate to="/reservation/all" replace />} />
        <Route path="/reservation/all" element={<DashboardLayout><AllReservations /></DashboardLayout>} />
        <Route path="/reservation/new" element={<DashboardLayout><AddReservation /></DashboardLayout>} />
        <Route path="/reservation/add" element={<DashboardLayout><AddReservation /></DashboardLayout>} />
        <Route path="/reservation/history" element={<DashboardLayout><ReservationHistory /></DashboardLayout>} />
        <Route path="/reservation/edit" element={<DashboardLayout><EditReservation /></DashboardLayout>} />
        <Route path="/reservation/edit/:id" element={<DashboardLayout><EditReservation /></DashboardLayout>} />
        <Route path="/reservation/cancelled" element={<DashboardLayout><CancelledBookings /></DashboardLayout>} />
        <Route path="/reservation/group" element={<DashboardLayout><GroupReservations /></DashboardLayout>} />
        <Route path="/reservations" element={<Navigate to="/reservation/all" replace />} />
        <Route path="/reservations/all" element={<Navigate to="/reservation/all" replace />} />
        <Route path="/reservations/new" element={<Navigate to="/reservation/new" replace />} />

        {/* Rooms Sub-Routes */}
        <Route path="/rooms" element={<DashboardLayout><Rooms /></DashboardLayout>} />
        <Route path="/rooms/all" element={<DashboardLayout><Rooms /></DashboardLayout>} />
        <Route path="/rooms/new" element={<DashboardLayout><AddRoom /></DashboardLayout>} />
        <Route path="/rooms/add" element={<DashboardLayout><AddRoom /></DashboardLayout>} />
        <Route path="/rooms/room-types" element={<DashboardLayout><RoomTypes /></DashboardLayout>} />
        <Route path="/rooms/rate-pricing" element={<DashboardLayout><RatePricing /></DashboardLayout>} />

        {/* Housekeeping Sub-Routes */}
        <Route path="/housekeeping" element={<Navigate to="/housekeeping/rooms-cleaning" replace />} />
        <Route path="/housekeeping/rooms-cleaning" element={<DashboardLayout><RoomsAndCleaning /></DashboardLayout>} />
        <Route path="/housekeeping/inspection" element={<DashboardLayout><Inspection /></DashboardLayout>} />
        <Route path="/housekeeping/staff-assignment" element={<DashboardLayout><StaffAssignment /></DashboardLayout>} />
        <Route path="/housekeeping/cleaning-schedule" element={<DashboardLayout><CleaningSchedule /></DashboardLayout>} />
        <Route path="/housekeeping/lost-and-found" element={<DashboardLayout><LostAndFound /></DashboardLayout>} />
        <Route path="/housekeeping/inspection-checklist" element={<DashboardLayout><InspectionChecklist /></DashboardLayout>} />

        <Route path="/guests" element={<DashboardLayout><Guests /></DashboardLayout>} />
        <Route path="/guests/profile" element={<DashboardLayout><GuestProfile /></DashboardLayout>} />
        
        {/* Occupancy Module */}
        <Route path="/occupancy" element={<DashboardLayout><Occupancy /></DashboardLayout>} />
        
        {/* Car Parking Route */}
        <Route path="/car-parking" element={<DashboardLayout><CarParking /></DashboardLayout>} />

        {/* Inventory Sub-Routes */}
        <Route path="/inventory" element={<DashboardLayout><AllInventory /></DashboardLayout>} />
        <Route path="/inventory/stock" element={<DashboardLayout><AllInventory /></DashboardLayout>} />
        <Route path="/inventory/all" element={<DashboardLayout><AllInventory /></DashboardLayout>} />
        <Route path="/inventory/guest-charges" element={<DashboardLayout><GuestCharges /></DashboardLayout>} />
        <Route path="/inventory/charges" element={<DashboardLayout><GuestCharges /></DashboardLayout>} />
        <Route path="/inventory/add" element={<DashboardLayout><GuestCharges /></DashboardLayout>} />
        <Route path="/inventory/missing" element={<DashboardLayout><MissingInventory /></DashboardLayout>} />
        <Route path="/inventory/missing-items" element={<DashboardLayout><MissingInventory /></DashboardLayout>} />

        {/* Rates & Pricing Sub-Routes */}
        <Route path="/rates-pricing" element={<Navigate to="/rates-pricing/rate-plans" replace />} />
        <Route path="/rates-pricing/rate-plans" element={<DashboardLayout><RatePlans /></DashboardLayout>} />
        <Route path="/rates-pricing/discounts" element={<DashboardLayout><Discounts /></DashboardLayout>} />
        <Route path="/rates-pricing/taxes-fees" element={<DashboardLayout><TaxesFees /></DashboardLayout>} />
        <Route path="/rates" element={<Navigate to="/rates-pricing/rate-plans" replace />} />
        <Route path="/pricing" element={<Navigate to="/rates-pricing/rate-plans" replace />} />

        {/* Payment & Billing Sub-Routes */}
        <Route path="/payment-billing" element={<Navigate to="/payment-billing/invoices" replace />} />
        <Route path="/payment-billing/invoices" element={<DashboardLayout><Invoices /></DashboardLayout>} />
        <Route path="/payment-billing/payment-history" element={<DashboardLayout><PaymentHistory /></DashboardLayout>} />
        <Route path="/payment-billing/pending-payments" element={<DashboardLayout><PendingPayments /></DashboardLayout>} />
        <Route path="/payment-billing/refunds" element={<DashboardLayout><Refunds /></DashboardLayout>} />
        <Route path="/payments" element={<Navigate to="/payment-billing/invoices" replace />} />
        <Route path="/billing" element={<Navigate to="/payment-billing/invoices" replace />} />

        {/* Guests Sub-Routes */}
        <Route path="/guests" element={<DashboardLayout><Guests /></DashboardLayout>} />
        <Route path="/guests/:id" element={<DashboardLayout><GuestProfile /></DashboardLayout>} />
        <Route path="/guest/:id" element={<DashboardLayout><GuestProfile /></DashboardLayout>} />

        {/* Occupancy Sub-Routes */}
        <Route path="/occupancy" element={<DashboardLayout><Occupancy /></DashboardLayout>} />

        {/* HR Sub-Routes */}
        <Route path="/hr" element={<Navigate to="/hr/staff" replace />} />
        <Route path="/hr/staff" element={<DashboardLayout><AllStaff /></DashboardLayout>} />
        <Route path="/hr/staff/all" element={<DashboardLayout><AllStaff /></DashboardLayout>} />
        <Route path="/hr/staff/add" element={<DashboardLayout><AddStaff /></DashboardLayout>} />
        <Route path="/hr/staff/new" element={<DashboardLayout><AddStaff /></DashboardLayout>} />
        <Route path="/hr/staff/:id" element={<DashboardLayout><StaffProfile /></DashboardLayout>} />
        <Route path="/hr/staff/:id/edit" element={<DashboardLayout><EditStaff /></DashboardLayout>} />
        <Route path="/hr/leave-requests" element={<DashboardLayout><LeaveRequests /></DashboardLayout>} />
        <Route path="/hr/attendance" element={<DashboardLayout><AttendanceSheet /></DashboardLayout>} />
        <Route path="/hr/attendance/today" element={<DashboardLayout><TodaysAttendance /></DashboardLayout>} />
        <Route path="/hr/attendance/todays-attendance" element={<DashboardLayout><TodaysAttendance /></DashboardLayout>} />
        <Route path="/hr/employee-salary" element={<DashboardLayout><EmployeeSalary /></DashboardLayout>} />
        <Route path="/hr/salary" element={<DashboardLayout><EmployeeSalary /></DashboardLayout>} />

        {/* Reports Sub-Routes */}
        <Route path="/reports" element={<Navigate to="/reports/expense" replace />} />
        <Route path="/reports/:tab" element={<DashboardLayout><ReportsPage /></DashboardLayout>} />

        <Route path="/audit-log" element={<DashboardLayout><AuditLog /></DashboardLayout>} />
        {/* Settings Sub-Routes */}
        <Route path="/settings" element={<Navigate to="/settings/hotel-profile" replace />} />
        <Route path="/settings/hotel-profile" element={<DashboardLayout><HotelProfile /></DashboardLayout>} />
        <Route path="/settings/policies" element={<DashboardLayout><Policies /></DashboardLayout>} />
        <Route path="/hotel-settings" element={<Navigate to="/hotel-settings/hotel-profile" replace />} />
        <Route path="/hotel-settings/hotel-profile" element={<DashboardLayout><HotelProfile /></DashboardLayout>} />
        <Route path="/hotel-settings/policies" element={<DashboardLayout><Policies /></DashboardLayout>} />

        {/* Restaurant Sub-Routes */}
        <Route path="/restaurant" element={<Navigate to="/restaurant/menu" replace />} />
        <Route path="/restaurant/menu" element={<DashboardLayout><Restaurant /></DashboardLayout>} />
        <Route path="/restaurant/orders" element={<DashboardLayout><Restaurant /></DashboardLayout>} />

        {/* Events & Banquets Sub-Routes */}
        <Route path="/events" element={<Navigate to="/events/all-events" replace />} />
        <Route path="/events/all-events" element={<DashboardLayout><AllEvents /></DashboardLayout>} />
        <Route path="/events/add-event" element={<DashboardLayout><AddEvent /></DashboardLayout>} />
        <Route path="/events/new" element={<DashboardLayout><AddEvent /></DashboardLayout>} />
        <Route path="/events/banquet-manager" element={<DashboardLayout><BanquetManager /></DashboardLayout>} />

        {/* Assistant Route */}
        <Route path="/ai-assistant" element={<DashboardLayout><LuxuriaAssistant /></DashboardLayout>} />

        {/* Fallback Catch-All Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
