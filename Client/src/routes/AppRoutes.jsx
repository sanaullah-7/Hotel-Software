import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout/DashboardLayout";
import Dashboard from "../pages/Dashboard/Dashboard";

// Front Office Module Pages
import OperationsAlerts from "../pages/FrontOffice/OperationsAlerts";
import CheckInOut from "../pages/FrontOffice/CheckInOut";
import RegistrationForms from "../pages/FrontOffice/RegistrationForms";
import NewRegistrationForm from "../pages/FrontOffice/NewRegistrationForm";
import GuestComplaint from "../pages/FrontOffice/GuestComplaint";

// Reservation Module Pages
import AddReservation from "../pages/Reservation/AddReservation";
import AllReservations from "../pages/Reservation/AllReservations";
import ReservationHistory from "../pages/Reservation/ReservationHistory";

// Rooms Module Pages
import Rooms from "../pages/Rooms/Rooms";
import AddRoom from "../pages/Rooms/AddRoom";

// Housekeeping Module Pages
import RoomsAndCleaning from "../pages/Housekeeping/RoomsAndCleaning";
import Inspection from "../pages/Housekeeping/Inspection";
import StaffAssignment from "../pages/Housekeeping/StaffAssignment";

// Inventory Module Pages
import AllInventory from "../pages/Inventory/AllInventory";
import AddInventory from "../pages/Inventory/AddInventory";
import MissingInventory from "../pages/Inventory/MissingInventory";

// Rates & Pricing Module Pages
import RatePlans from "../pages/RatesPricing/RatePlans";
import Discounts from "../pages/RatesPricing/Discounts";
import TaxesFees from "../pages/RatesPricing/TaxesFees";

// Payment & Billing Module Pages
import Invoices from "../pages/PaymentBilling/Invoices";
import PaymentHistory from "../pages/PaymentBilling/PaymentHistory";
import PendingPayments from "../pages/PaymentBilling/PendingPayments";
import Refunds from "../pages/PaymentBilling/Refunds";

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

        {/* Inventory Sub-Routes */}
        <Route
          path="/inventory"
          element={
            <DashboardLayout>
              <AllInventory />
            </DashboardLayout>
          }
        />
        <Route
          path="/inventory/add"
          element={
            <DashboardLayout>
              <AddInventory />
            </DashboardLayout>
          }
        />
        <Route
          path="/inventory/missing"
          element={
            <DashboardLayout>
              <MissingInventory />
            </DashboardLayout>
          }
        />
        {/* Rates & Pricing Sub-Routes */}
        <Route
          path="/rates-pricing"
          element={<Navigate to="/rates-pricing/rate-plans" replace />}
        />
        <Route
          path="/rates-pricing/rate-plans"
          element={
            <DashboardLayout>
              <RatePlans />
            </DashboardLayout>
          }
        />
        <Route
          path="/rates-pricing/discounts"
          element={
            <DashboardLayout>
              <Discounts />
            </DashboardLayout>
          }
        />
        <Route
          path="/rates-pricing/taxes-fees"
          element={
            <DashboardLayout>
              <TaxesFees />
            </DashboardLayout>
          }
        />

        {/* Payment & Billing Sub-Routes */}
        <Route
          path="/payment-billing"
          element={<Navigate to="/payment-billing/invoices" replace />}
        />
        <Route
          path="/payment-billing/invoices"
          element={
            <DashboardLayout>
              <Invoices />
            </DashboardLayout>
          }
        />
        <Route
          path="/payment-billing/payment-history"
          element={
            <DashboardLayout>
              <PaymentHistory />
            </DashboardLayout>
          }
        />
        <Route
          path="/payment-billing/pending-payments"
          element={
            <DashboardLayout>
              <PendingPayments />
            </DashboardLayout>
          }
        />
        <Route
          path="/payment-billing/refunds"
          element={
            <DashboardLayout>
              <Refunds />
            </DashboardLayout>
          }
        />
      </Routes>
    </Router>
  );
}
