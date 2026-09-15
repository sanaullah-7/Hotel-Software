import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SuperAdminProtectedRoutes from './SuperAdminProtectedRoutes.jsx';
import SuperAdminLayout from '../Components/Layout/SuperAdminLayout.jsx';
import LoadingState from '../Components/Common/LaodingState.jsx';

// Lazy-loaded pages
const Login         = lazy(() => import('../Pages/Login.jsx'));
const Dashboard     = lazy(() => import('../Pages/Dashboard/Dashboard.jsx'));
const Hotels        = lazy(() => import('../Pages/Hotels/Hotels.jsx'));
const PendingHotels = lazy(() => import('../Pages/Hotels/PendingHotels.jsx'));
const HotelDetails  = lazy(() => import('../Pages/Hotels/HotelDetails.jsx'));
const Users         = lazy(() => import('../Pages/Users/User.jsx'));
const Managers      = lazy(() => import('../Pages/Managers/Managers.jsx'));
const Receptionists = lazy(() => import('../Pages/Receptionists/Receptionist.jsx'));
const Approvals     = lazy(() => import('../Pages/Approvals/Approvels.jsx'));
const PendingApprovals = lazy(() => import('../Pages/Approvals/PendingApprovals.jsx'));
const ApprovedReqs  = lazy(() => import('../Pages/Approvals/ApprovedRequest.jsx'));
const RejectedReqs  = lazy(() => import('../Pages/Approvals/RejectedRequsts.jsx'));
const Subscriptions = lazy(() => import('../Pages/Subscriptions/Subscriptions.jsx'));
const Plans         = lazy(() => import('../Pages/Subscriptions/Plans.jsx'));
const Revenue       = lazy(() => import('../Pages/Revenue/Revenue.jsx'));
const Transactions  = lazy(() => import('../Pages/Revenue/Transaction.jsx'));
const Reports       = lazy(() => import('../Pages/Reports/Reports.jsx'));
const HotelReports  = lazy(() => import('../Pages/Reports/HotelReports.jsx'));
const RevenueReport = lazy(() => import('../Pages/Reports/RevenueReport.jsx'));
const UserReport    = lazy(() => import('../Pages/Reports/UserReeport.jsx'));
const Notifications = lazy(() => import('../Pages/Notifications/Notifications.jsx'));
const AuditLogs     = lazy(() => import('../Pages/AuditLogs/AuditLogs.jsx'));
const Settings      = lazy(() => import('../Pages/Settings/Settings.jsx'));
const Profile       = lazy(() => import('../Pages/Profile/Profile.jsx'));
const SupportTicket = lazy(() => import('../Pages/Support/SupportTicket.jsx'));

const Fallback = () => <LoadingState message="Loading page…" />;

export default function SuperAdminRoutes() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route element={<SuperAdminProtectedRoutes />}>
          <Route element={<SuperAdminLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"              element={<Dashboard />} />

            {/* Hotels */}
            <Route path="/hotels"                 element={<Hotels />} />
            <Route path="/hotels/pending"         element={<PendingHotels />} />
            <Route path="/hotels/:id"             element={<HotelDetails />} />

            {/* Users */}
            <Route path="/users"                  element={<Users />} />
            <Route path="/users/managers"         element={<Managers />} />
            <Route path="/users/receptionists"    element={<Receptionists />} />

            {/* Approvals */}
            <Route path="/approvals"              element={<Approvals />} />
            <Route path="/approvals/pending"      element={<PendingApprovals />} />
            <Route path="/approvals/approved"     element={<ApprovedReqs />} />
            <Route path="/approvals/rejected"     element={<RejectedReqs />} />

            {/* Operations */}
            <Route path="/subscriptions"          element={<Subscriptions />} />
            <Route path="/subscriptions/plans"    element={<Plans />} />
            <Route path="/revenue"                element={<Revenue />} />
            <Route path="/revenue/transactions"   element={<Transactions />} />

            {/* Analytics */}
            <Route path="/reports"                element={<Reports />} />
            <Route path="/reports/hotels"         element={<HotelReports />} />
            <Route path="/reports/revenue"        element={<RevenueReport />} />
            <Route path="/reports/users"          element={<UserReport />} />
            <Route path="/audit-logs"             element={<AuditLogs />} />

            {/* System */}
            <Route path="/notifications"          element={<Notifications />} />
            <Route path="/support"                element={<SupportTicket />} />
            <Route path="/settings"               element={<Settings />} />
            <Route path="/profile"                element={<Profile />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
