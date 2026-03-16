import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

type AppRole = 'admin' | 'engineer' | 'customer';

interface ProtectedRouteProps {
  allowedRoles?: AppRole[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, roles, loading } = useAuth();

  const effectiveRole: AppRole | null = roles.includes('admin')
    ? 'admin'
    : roles.includes('engineer')
      ? 'engineer'
      : roles.includes('customer')
        ? 'customer'
        : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in → go to auth
  if (!user) return <Navigate to="/auth" replace />;

  // Wrong role for this section → back to index, which routes to their dashboard
  if (allowedRoles && (!effectiveRole || !allowedRoles.includes(effectiveRole))) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
