import { Navigate, Outlet } from 'react-router-dom';
import { useSuperAdmin } from '../Context/SuperAdminContext.jsx';

/**
 * Protects all Super Admin routes.
 * Redirects to /login if not authenticated.
 */
export default function SuperAdminProtectedRoutes() {
  const { isAuthenticated } = useSuperAdmin();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
