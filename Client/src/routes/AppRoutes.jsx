import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoadingState from '../components/common/LoadingState';

// Eager Shell & Core Pages
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import DashboardLayout from '../layouts/DashboardLayout/DashboardLayout';
import Dashboard from '../pages/Dashboard/Dashboard';

// Front Office Module Pages
const OperationsAlerts = lazy(() => import('../features/front-office/pages/OperationsAlerts'));
const CheckInOut = lazy(() => import('../features/front-office/pages/CheckInOut'));
const RegistrationForms = lazy(() => import('../features/front-office/pages/RegistrationForms'));
const NewRegistrationForm = lazy(() => import('../features/front-office/pages/NewRegistrationForm'));
const GuestComplaint = lazy(() => import('../features/front-office/pages/GuestComplaint'));

// Reservation Module Pages
const AddReservation = lazy(() => import('../features/reservations/pages/AddReservation'));
const AllReservations = lazy(() => import('../features/reservations/pages/AllReservations'));
const ReservationHistory = lazy(() => import('../features/reservations/pages/ReservationHistory'));
const EditReservation = lazy(() => import('../features/reservations/pages/EditReservation'));
const CancelledBookings = lazy(() => import('../features/reservations/pages/CancelledBookings'));
const GroupReservations = lazy(() => import('../features/reservations/pages/GroupReservations'));

// Rooms Module Pages
const Rooms = lazy(() => import('../features/rooms/pages/Rooms'));
const AddRoom = lazy(() => import('../features/rooms/pages/AddRoom'));
const RoomTypes = lazy(() => import('../features/rooms/pages/RoomTypes'));
const RatePricing = lazy(() => import('../features/rooms/pages/RatePricing'));

// Housekeeping Module Pages
const RoomsAndCleaning = lazy(() => import('../features/housekeeping/pages/RoomsAndCleaning'));
const Inspection = lazy(() => import('../features/housekeeping/pages/Inspection'));
const StaffAssignment = lazy(() => import('../features/housekeeping/pages/StaffAssignment'));
const CleaningSchedule = lazy(() => import('../features/housekeeping/pages/CleaningSchedule'));
const LostAndFound = lazy(() => import('../features/housekeeping/pages/LostAndFound'));
const InspectionChecklist = lazy(() => import('../features/housekeeping/pages/InspectionChecklist'));

// Inventory Module Pages
const AllInventory = lazy(() => import('../features/inventory/pages/AllInventory'));
const GuestCharges = lazy(() => import('../features/inventory/pages/GuestCharges'));
const MissingInventory = lazy(() => import('../features/inventory/pages/MissingInventory'));

// Rates & Pricing Module Pages
const RatePlans = lazy(() => import('../features/rates-pricing/pages/RatePlans'));
const Discounts = lazy(() => import('../features/rates-pricing/pages/Discounts'));
const TaxesFees = lazy(() => import('../features/rates-pricing/pages/TaxesFees'));

// Payment & Billing Module Pages
const Invoices = lazy(() => import('../features/payment-billing/pages/Invoices'));
const PaymentHistory = lazy(() => import('../features/payment-billing/pages/PaymentHistory'));
const PendingPayments = lazy(() => import('../features/payment-billing/pages/PendingPayments'));
const Refunds = lazy(() => import('../features/payment-billing/pages/Refunds'));

// Guests Module
const Guests = lazy(() => import('../features/guests/pages/Guests'));
const GuestProfile = lazy(() => import('../features/guests/pages/GuestProfile'));

// Occupancy Module
const Occupancy = lazy(() => import('../features/occupancy/pages/Occupancy'));
const CarParking = lazy(() => import('../features/car-parking/pages/CarParking'));

// HR Module Pages
const AllStaff = lazy(() => import('../features/staff/pages/AllStaff'));
const AddStaff = lazy(() => import('../features/staff/pages/AddStaff'));
const EditStaff = lazy(() => import('../features/staff/pages/EditStaff'));
const StaffProfile = lazy(() => import('../features/staff/pages/StaffProfile'));
const LeaveRequests = lazy(() => import('../features/staff/pages/LeaveRequests'));
const AttendanceSheet = lazy(() => import('../features/staff/pages/AttendanceSheet'));
const TodaysAttendance = lazy(() => import('../features/staff/pages/TodaysAttendance'));
const EmployeeSalary = lazy(() => import('../features/staff/pages/EmployeeSalary'));

// Reports Module Pages
const ReportsPage = lazy(() => import('../features/reports/pages/ReportsPage'));

// Audit Log
const AuditLog = lazy(() => import('../features/audit/pages/AuditLog'));

// Settings Module Pages
const HotelProfile = lazy(() => import('../features/settings/pages/HotelProfile'));
const Policies = lazy(() => import('../features/settings/pages/Policies'));

// Restaurant Module Pages
const Restaurant = lazy(() => import('../features/restaurant/pages/Restaurant'));

// Events & Banquets Module Pages
const BanquetManager = lazy(() => import('../features/events/pages/BanquetManager'));
const AllEvents = lazy(() => import('../features/events/pages/AllEvents'));
const AddEvent = lazy(() => import('../features/events/pages/AddEvent'));

// Assistant Module
const LuxuriaAssistant = lazy(() => import('../features/assistant/pages/LuxuriaAssistant'));

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Core & Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />

        {/* Front Office Sub-Routes */}
        <Route path="/front-office" element={<DashboardLayout><Suspense fallback={<LoadingState />}><OperationsAlerts /></Suspense></DashboardLayout>} />
        <Route path="/front-office/operations-alerts" element={<DashboardLayout><Suspense fallback={<LoadingState />}><OperationsAlerts /></Suspense></DashboardLayout>} />
        <Route path="/front-office/check-in-out" element={<DashboardLayout><Suspense fallback={<LoadingState />}><CheckInOut /></Suspense></DashboardLayout>} />
        <Route path="/front-office/registration-forms" element={<DashboardLayout><Suspense fallback={<LoadingState />}><RegistrationForms /></Suspense></DashboardLayout>} />
        <Route path="/front-office/registration-forms/new" element={<DashboardLayout><Suspense fallback={<LoadingState />}><NewRegistrationForm /></Suspense></DashboardLayout>} />
        <Route path="/front-office/guest-complaint" element={<DashboardLayout><Suspense fallback={<LoadingState />}><GuestComplaint /></Suspense></DashboardLayout>} />
        <Route path="/front-office/guest-complaints" element={<DashboardLayout><Suspense fallback={<LoadingState />}><GuestComplaint /></Suspense></DashboardLayout>} />

        {/* Reservation Sub-Routes */}
        <Route path="/reservation" element={<Navigate to="/reservation/all" replace />} />
        <Route path="/reservation/all" element={<DashboardLayout><Suspense fallback={<LoadingState />}><AllReservations /></Suspense></DashboardLayout>} />
        <Route path="/reservation/new" element={<DashboardLayout><Suspense fallback={<LoadingState />}><AddReservation /></Suspense></DashboardLayout>} />
        <Route path="/reservation/add" element={<DashboardLayout><Suspense fallback={<LoadingState />}><AddReservation /></Suspense></DashboardLayout>} />
        <Route path="/reservation/history" element={<DashboardLayout><Suspense fallback={<LoadingState />}><ReservationHistory /></Suspense></DashboardLayout>} />
        <Route path="/reservation/edit" element={<DashboardLayout><Suspense fallback={<LoadingState />}><EditReservation /></Suspense></DashboardLayout>} />
        <Route path="/reservation/edit/:id" element={<DashboardLayout><Suspense fallback={<LoadingState />}><EditReservation /></Suspense></DashboardLayout>} />
        <Route path="/reservation/cancelled" element={<DashboardLayout><Suspense fallback={<LoadingState />}><CancelledBookings /></Suspense></DashboardLayout>} />
        <Route path="/reservation/group" element={<DashboardLayout><Suspense fallback={<LoadingState />}><GroupReservations /></Suspense></DashboardLayout>} />
        <Route path="/reservations" element={<Navigate to="/reservation/all" replace />} />
        <Route path="/reservations/all" element={<Navigate to="/reservation/all" replace />} />
        <Route path="/reservations/new" element={<Navigate to="/reservation/new" replace />} />

        {/* Rooms Sub-Routes */}
        <Route path="/rooms" element={<DashboardLayout><Suspense fallback={<LoadingState />}><Rooms /></Suspense></DashboardLayout>} />
        <Route path="/rooms/all" element={<DashboardLayout><Suspense fallback={<LoadingState />}><Rooms /></Suspense></DashboardLayout>} />
        <Route path="/rooms/new" element={<DashboardLayout><Suspense fallback={<LoadingState />}><AddRoom /></Suspense></DashboardLayout>} />
        <Route path="/rooms/add" element={<DashboardLayout><Suspense fallback={<LoadingState />}><AddRoom /></Suspense></DashboardLayout>} />
        <Route path="/rooms/room-types" element={<DashboardLayout><Suspense fallback={<LoadingState />}><RoomTypes /></Suspense></DashboardLayout>} />
        <Route path="/rooms/rate-pricing" element={<DashboardLayout><Suspense fallback={<LoadingState />}><RatePricing /></Suspense></DashboardLayout>} />

        {/* Housekeeping Sub-Routes */}
        <Route path="/housekeeping" element={<Navigate to="/housekeeping/rooms-cleaning" replace />} />
        <Route path="/housekeeping/rooms-cleaning" element={<DashboardLayout><Suspense fallback={<LoadingState />}><RoomsAndCleaning /></Suspense></DashboardLayout>} />
        <Route path="/housekeeping/inspection" element={<DashboardLayout><Suspense fallback={<LoadingState />}><Inspection /></Suspense></DashboardLayout>} />
        <Route path="/housekeeping/staff-assignment" element={<DashboardLayout><Suspense fallback={<LoadingState />}><StaffAssignment /></Suspense></DashboardLayout>} />
        <Route path="/housekeeping/cleaning-schedule" element={<DashboardLayout><Suspense fallback={<LoadingState />}><CleaningSchedule /></Suspense></DashboardLayout>} />
        <Route path="/housekeeping/lost-and-found" element={<DashboardLayout><Suspense fallback={<LoadingState />}><LostAndFound /></Suspense></DashboardLayout>} />
        <Route path="/housekeeping/inspection-checklist" element={<DashboardLayout><Suspense fallback={<LoadingState />}><InspectionChecklist /></Suspense></DashboardLayout>} />
        {/* Car Parking Route */}
        <Route path="/car-parking" element={<DashboardLayout><Suspense fallback={<LoadingState />}><CarParking /></Suspense></DashboardLayout>} />

        {/* Inventory Sub-Routes */}
        <Route path="/inventory" element={<DashboardLayout><Suspense fallback={<LoadingState />}><AllInventory /></Suspense></DashboardLayout>} />
        <Route path="/inventory/stock" element={<DashboardLayout><Suspense fallback={<LoadingState />}><AllInventory /></Suspense></DashboardLayout>} />
        <Route path="/inventory/all" element={<DashboardLayout><Suspense fallback={<LoadingState />}><AllInventory /></Suspense></DashboardLayout>} />
        <Route path="/inventory/guest-charges" element={<DashboardLayout><Suspense fallback={<LoadingState />}><GuestCharges /></Suspense></DashboardLayout>} />
        <Route path="/inventory/charges" element={<DashboardLayout><Suspense fallback={<LoadingState />}><GuestCharges /></Suspense></DashboardLayout>} />
        <Route path="/inventory/add" element={<DashboardLayout><Suspense fallback={<LoadingState />}><GuestCharges /></Suspense></DashboardLayout>} />
        <Route path="/inventory/missing" element={<DashboardLayout><Suspense fallback={<LoadingState />}><MissingInventory /></Suspense></DashboardLayout>} />
        <Route path="/inventory/missing-items" element={<DashboardLayout><Suspense fallback={<LoadingState />}><MissingInventory /></Suspense></DashboardLayout>} />

        {/* Rates & Pricing Sub-Routes */}
        <Route path="/rates-pricing" element={<Navigate to="/rates-pricing/rate-plans" replace />} />
        <Route path="/rates-pricing/rate-plans" element={<DashboardLayout><Suspense fallback={<LoadingState />}><RatePlans /></Suspense></DashboardLayout>} />
        <Route path="/rates-pricing/discounts" element={<DashboardLayout><Suspense fallback={<LoadingState />}><Discounts /></Suspense></DashboardLayout>} />
        <Route path="/rates-pricing/taxes-fees" element={<DashboardLayout><Suspense fallback={<LoadingState />}><TaxesFees /></Suspense></DashboardLayout>} />
        <Route path="/rates" element={<Navigate to="/rates-pricing/rate-plans" replace />} />
        <Route path="/pricing" element={<Navigate to="/rates-pricing/rate-plans" replace />} />

        {/* Payment & Billing Sub-Routes */}
        <Route path="/payment-billing" element={<Navigate to="/payment-billing/invoices" replace />} />
        <Route path="/payment-billing/invoices" element={<DashboardLayout><Suspense fallback={<LoadingState />}><Invoices /></Suspense></DashboardLayout>} />
        <Route path="/payment-billing/payment-history" element={<DashboardLayout><Suspense fallback={<LoadingState />}><PaymentHistory /></Suspense></DashboardLayout>} />
        <Route path="/payment-billing/pending-payments" element={<DashboardLayout><Suspense fallback={<LoadingState />}><PendingPayments /></Suspense></DashboardLayout>} />
        <Route path="/payment-billing/refunds" element={<DashboardLayout><Suspense fallback={<LoadingState />}><Refunds /></Suspense></DashboardLayout>} />
        <Route path="/payments" element={<Navigate to="/payment-billing/invoices" replace />} />
        <Route path="/billing" element={<Navigate to="/payment-billing/invoices" replace />} />

        {/* Guests Sub-Routes */}
        <Route path="/guests" element={<DashboardLayout><Suspense fallback={<LoadingState />}><Guests /></Suspense></DashboardLayout>} />
        <Route path="/guests/:id" element={<DashboardLayout><Suspense fallback={<LoadingState />}><GuestProfile /></Suspense></DashboardLayout>} />
        <Route path="/guest/:id" element={<DashboardLayout><Suspense fallback={<LoadingState />}><GuestProfile /></Suspense></DashboardLayout>} />

        {/* Occupancy Sub-Routes */}
        <Route path="/occupancy" element={<DashboardLayout><Suspense fallback={<LoadingState />}><Occupancy /></Suspense></DashboardLayout>} />

        {/* HR Sub-Routes */}
        <Route path="/hr" element={<Navigate to="/hr/staff" replace />} />
        <Route path="/hr/staff" element={<DashboardLayout><Suspense fallback={<LoadingState />}><AllStaff /></Suspense></DashboardLayout>} />
        <Route path="/hr/staff/all" element={<DashboardLayout><Suspense fallback={<LoadingState />}><AllStaff /></Suspense></DashboardLayout>} />
        <Route path="/hr/staff/add" element={<DashboardLayout><Suspense fallback={<LoadingState />}><AddStaff /></Suspense></DashboardLayout>} />
        <Route path="/hr/staff/new" element={<DashboardLayout><Suspense fallback={<LoadingState />}><AddStaff /></Suspense></DashboardLayout>} />
        <Route path="/hr/staff/:id" element={<DashboardLayout><Suspense fallback={<LoadingState />}><StaffProfile /></Suspense></DashboardLayout>} />
        <Route path="/hr/staff/:id/edit" element={<DashboardLayout><Suspense fallback={<LoadingState />}><EditStaff /></Suspense></DashboardLayout>} />
        <Route path="/hr/leave-requests" element={<DashboardLayout><Suspense fallback={<LoadingState />}><LeaveRequests /></Suspense></DashboardLayout>} />
        <Route path="/hr/attendance" element={<DashboardLayout><Suspense fallback={<LoadingState />}><AttendanceSheet /></Suspense></DashboardLayout>} />
        <Route path="/hr/attendance/today" element={<DashboardLayout><Suspense fallback={<LoadingState />}><TodaysAttendance /></Suspense></DashboardLayout>} />
        <Route path="/hr/attendance/todays-attendance" element={<DashboardLayout><Suspense fallback={<LoadingState />}><TodaysAttendance /></Suspense></DashboardLayout>} />
        <Route path="/hr/employee-salary" element={<DashboardLayout><Suspense fallback={<LoadingState />}><EmployeeSalary /></Suspense></DashboardLayout>} />
        <Route path="/hr/salary" element={<DashboardLayout><Suspense fallback={<LoadingState />}><EmployeeSalary /></Suspense></DashboardLayout>} />

        {/* Reports Sub-Routes */}
        <Route path="/reports" element={<Navigate to="/reports/expense" replace />} />
        <Route path="/reports/:tab" element={<DashboardLayout><Suspense fallback={<LoadingState />}><ReportsPage /></Suspense></DashboardLayout>} />

        <Route path="/audit-log" element={<DashboardLayout><Suspense fallback={<LoadingState />}><AuditLog /></Suspense></DashboardLayout>} />
        {/* Settings Sub-Routes */}
        <Route path="/settings" element={<Navigate to="/settings/hotel-profile" replace />} />
        <Route path="/settings/hotel-profile" element={<DashboardLayout><Suspense fallback={<LoadingState />}><HotelProfile /></Suspense></DashboardLayout>} />
        <Route path="/settings/policies" element={<DashboardLayout><Suspense fallback={<LoadingState />}><Policies /></Suspense></DashboardLayout>} />
        <Route path="/hotel-settings" element={<Navigate to="/hotel-settings/hotel-profile" replace />} />
        <Route path="/hotel-settings/hotel-profile" element={<DashboardLayout><Suspense fallback={<LoadingState />}><HotelProfile /></Suspense></DashboardLayout>} />
        <Route path="/hotel-settings/policies" element={<DashboardLayout><Suspense fallback={<LoadingState />}><Policies /></Suspense></DashboardLayout>} />

        {/* Restaurant Sub-Routes */}
        <Route path="/restaurant" element={<Navigate to="/restaurant/menu" replace />} />
        <Route path="/restaurant/menu" element={<DashboardLayout><Suspense fallback={<LoadingState />}><Restaurant /></Suspense></DashboardLayout>} />
        <Route path="/restaurant/orders" element={<DashboardLayout><Suspense fallback={<LoadingState />}><Restaurant /></Suspense></DashboardLayout>} />

        {/* Events & Banquets Sub-Routes */}
        <Route path="/events" element={<Navigate to="/events/all-events" replace />} />
        <Route path="/events/all-events" element={<DashboardLayout><Suspense fallback={<LoadingState />}><AllEvents /></Suspense></DashboardLayout>} />
        <Route path="/events/add-event" element={<DashboardLayout><Suspense fallback={<LoadingState />}><AddEvent /></Suspense></DashboardLayout>} />
        <Route path="/events/new" element={<DashboardLayout><Suspense fallback={<LoadingState />}><AddEvent /></Suspense></DashboardLayout>} />
        <Route path="/events/banquet-manager" element={<DashboardLayout><Suspense fallback={<LoadingState />}><BanquetManager /></Suspense></DashboardLayout>} />

        {/* Assistant Route */}
        <Route path="/ai-assistant" element={<DashboardLayout><Suspense fallback={<LoadingState />}><LuxuriaAssistant /></Suspense></DashboardLayout>} />

        {/* Fallback Catch-All Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
