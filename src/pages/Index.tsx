import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, roles, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  // If user has no roles, redirect to role selection
  if (roles.length === 0) {
    return <Navigate to="/role-selection" replace />;
  }

  // Route based on role
  if (roles.includes('admin') || roles.includes('project_manager') || roles.includes('qa_manager')) {
    return <Navigate to="/admin" replace />;
  }
  if (roles.includes('engineer')) {
    return <Navigate to="/engineer" replace />;
  }
  if (roles.includes('customer')) {
    return <Navigate to="/customer" replace />;
  }

  // Fallback to role selection if no matching role
  return <Navigate to="/role-selection" replace />;
};

export default Index;
