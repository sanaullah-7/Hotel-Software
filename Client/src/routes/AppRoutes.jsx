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
import EditReservation from '../pages/Reservation/EditReservation';
import CancelledBookings from '../pages/Reservation/CancelledBookings';
import GroupReservations from '../pages/Reservation/GroupReservations';

// Rooms Module Pages
import Rooms from '../pages/Rooms/Rooms';
import AddRoom from '../pages/Rooms/AddRoom';
import RoomTypes from '../pages/Rooms/RoomTypes';
import RatePricing from '../pages/Rooms/RatePricing';

// Housekeeping Module Pages
import RoomsAndCleaning from '../pages/Housekeeping/RoomsAndCleaning';
import Inspection from '../pages/Housekeeping/Inspection';
import StaffAssignment from '../pages/Housekeeping/StaffAssignment';
import CleaningSchedule from '../pages/Housekeeping/CleaningSchedule';
import LostAndFound from '../pages/Housekeeping/LostAndFound';
import InspectionChecklist from '../pages/Housekeeping/InspectionChecklist';

// Inventory Module Pages
import AllInventory from '../pages/Inventory/AllInventory';
import AddInventory from '../pages/Inventory/AddInventory';
import GuestCharges from '../pages/Inventory/GuestCharges';
import MissingInventory from '../pages/Inventory/MissingInventory';

// Rates & Pricing Module Pages
import RatePlans from '../pages/RatesPricing/RatePlans';
import Discounts from '../pages/RatesPricing/Discounts';
import TaxesFees from '../pages/RatesPricing/TaxesFees';

// Payment & Billing Module Pages
import Invoices from '../pages/PaymentBilling/Invoices';
import PaymentHistory from '../pages/PaymentBilling/PaymentHistory';
import PendingPayments from '../pages/PaymentBilling/PendingPayments';
import Refunds from '../pages/PaymentBilling/Refunds';

// Guests Module
import Guests from '../pages/Guests/Guests';

// Occupancy Module
import Occupancy from '../pages/Occupancy/Occupancy';

// HR Module Pages
import AllStaff from '../pages/HR/Staff/AllStaff';
import AddStaff from '../pages/HR/Staff/AddStaff';
import EditStaff from '../pages/HR/Staff/EditStaff';
import StaffProfile from '../pages/HR/Staff/StaffProfile';
import LeaveRequests from '../pages/HR/LeaveRequests/LeaveRequests';
import AttendanceSheet from '../pages/HR/Attendance/AttendanceSheet';
import TodaysAttendance from '../pages/HR/Attendance/TodaysAttendance';
import EmployeeSalary from '../pages/HR/Salary/EmployeeSalary';

// Reports Module Pages
import StocksExpenseRevenue from '../pages/Reports/StocksExpenseRevenue';
import OccupancyReport from '../pages/Reports/OccupancyReport';
import ExpenseVsRevenue from '../pages/Reports/ExpenseVsRevenue';
import ExpenseManagement from '../pages/Reports/ExpenseManagement';

// Settings Module Pages
import HotelProfile from '../pages/Settings/HotelProfile';
import Policies from '../pages/Settings/Policies';

// Restaurant Module Pages
import Restaurant from '../pages/Restaurant/Restaurant';

// Assistant Module
import LuxuriaAssistant from '../pages/Assistant/LuxuriaAssistant';

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardLayout><Dashboard /></DashboardLayout>} />

        {/* Front Office Sub-Routes */}
        <Route path="/front-office" element={<DashboardLayout><OperationsAlerts /></DashboardLayout>} />
        <Route path="/front-office/operations-alerts" element={<DashboardLayout><OperationsAlerts /></DashboardLayout>} />
        <Route path="/front-office/check-in-out" element={<DashboardLayout><CheckInOut /></DashboardLayout>} />
        <Route path="/front-office/registration-forms" element={<DashboardLayout><RegistrationForms /></DashboardLayout>} />
        <Route path="/front-office/registration-forms/new" element={<DashboardLayout><NewRegistrationForm /></DashboardLayout>} />
        <Route path="/front-office/guest-complaint" element={<DashboardLayout><GuestComplaint /></DashboardLayout>} />

        {/* Reservation Sub-Routes */}
        <Route path="/reservation" element={<Navigate to="/reservation/new" replace />} />
        <Route path="/reservation/new" element={<DashboardLayout><AddReservation /></DashboardLayout>} />
        <Route path="/reservation/all" element={<DashboardLayout><AllReservations /></DashboardLayout>} />
        <Route path="/reservation/history" element={<DashboardLayout><ReservationHistory /></DashboardLayout>} />
        <Route path="/reservation/edit" element={<DashboardLayout><EditReservation /></DashboardLayout>} />
        <Route path="/reservation/cancelled" element={<DashboardLayout><CancelledBookings /></DashboardLayout>} />
        <Route path="/reservation/group" element={<DashboardLayout><GroupReservations /></DashboardLayout>} />

        {/* Rooms Sub-Routes */}
        <Route path="/rooms" element={<DashboardLayout><Rooms /></DashboardLayout>} />
        <Route path="/rooms/new" element={<DashboardLayout><AddRoom /></DashboardLayout>} />
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

        {/* Inventory Sub-Routes */}
        <Route path="/inventory" element={<DashboardLayout><AllInventory /></DashboardLayout>} />
        <Route path="/inventory/stock" element={<DashboardLayout><AllInventory /></DashboardLayout>} />
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

        {/* Payment & Billing Sub-Routes */}
        <Route path="/payment-billing" element={<Navigate to="/payment-billing/invoices" replace />} />
        <Route path="/payment-billing/invoices" element={<DashboardLayout><Invoices /></DashboardLayout>} />
        <Route path="/payment-billing/payment-history" element={<DashboardLayout><PaymentHistory /></DashboardLayout>} />
        <Route path="/payment-billing/pending-payments" element={<DashboardLayout><PendingPayments /></DashboardLayout>} />
        <Route path="/payment-billing/refunds" element={<DashboardLayout><Refunds /></DashboardLayout>} />

        {/* Guests Sub-Routes */}
        <Route path="/guests" element={<DashboardLayout><Guests /></DashboardLayout>} />

        {/* Occupancy Sub-Routes */}
        <Route path="/occupancy" element={<DashboardLayout><Occupancy /></DashboardLayout>} />

        {/* HR Sub-Routes */}
        <Route path="/hr/staff" element={<DashboardLayout><AllStaff /></DashboardLayout>} />
        <Route path="/hr/staff/add" element={<DashboardLayout><AddStaff /></DashboardLayout>} />
        <Route path="/hr/staff/:id" element={<DashboardLayout><StaffProfile /></DashboardLayout>} />
        <Route path="/hr/staff/:id/edit" element={<DashboardLayout><EditStaff /></DashboardLayout>} />
        <Route path="/hr/leave-requests" element={<DashboardLayout><LeaveRequests /></DashboardLayout>} />
        <Route path="/hr/attendance" element={<DashboardLayout><AttendanceSheet /></DashboardLayout>} />
        <Route path="/hr/attendance/today" element={<DashboardLayout><TodaysAttendance /></DashboardLayout>} />
        <Route path="/hr/employee-salary" element={<DashboardLayout><EmployeeSalary /></DashboardLayout>} />

        {/* Reports Sub-Routes */}
        <Route path="/reports/stocks-expense-revenue" element={<DashboardLayout><StocksExpenseRevenue /></DashboardLayout>} />
        <Route path="/reports/occupancy" element={<DashboardLayout><OccupancyReport /></DashboardLayout>} />
        <Route path="/reports/expense-vs-revenue" element={<DashboardLayout><ExpenseVsRevenue /></DashboardLayout>} />
        <Route path="/reports/expense-management" element={<DashboardLayout><ExpenseManagement /></DashboardLayout>} />

        {/* Settings Sub-Routes */}
        <Route path="/settings/hotel-profile" element={<DashboardLayout><HotelProfile /></DashboardLayout>} />
        <Route path="/settings/policies" element={<DashboardLayout><Policies /></DashboardLayout>} />

        {/* Restaurant Sub-Routes */}
        <Route path="/restaurant" element={<Navigate to="/restaurant/menu" replace />} />
        <Route path="/restaurant/menu" element={<DashboardLayout><Restaurant /></DashboardLayout>} />
        <Route path="/restaurant/orders" element={<DashboardLayout><Restaurant /></DashboardLayout>} />

        {/* Assistant Route */}
        <Route path="/ai-assistant" element={<DashboardLayout><LuxuriaAssistant /></DashboardLayout>} />

      </Routes>
    </Router>
  );
}
