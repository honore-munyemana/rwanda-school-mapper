import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getAuthState, getDashboardPathForRole, type AuthRole } from './auth';

export function ProtectedRoute({ allowedRoles }: { allowedRoles: AuthRole[] }) {
  const location = useLocation();
  const auth = getAuthState();

  if (!auth?.isAuthenticated) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  if (!allowedRoles.includes(auth.role)) {
    return <Navigate to={getDashboardPathForRole(auth.role)} replace />;
  }

  return <Outlet />;
}

