import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2, Clock, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user, roles, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  // If user has no roles yet, show a pending approval screen
  if (roles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md space-y-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Clock className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Account Pending Approval</h1>
            <p className="text-muted-foreground">
              Your account has been created successfully. An administrator will
              review and assign your role shortly. Please check back later.
            </p>
          </div>
          <div className="text-sm text-muted-foreground bg-muted rounded-lg p-3">
            Signed in as <span className="font-medium text-foreground">{user.email}</span>
          </div>
          <Button variant="outline" onClick={signOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  // Route based on role
  if (roles.includes('admin')) {
    return <Navigate to="/admin" replace />;
  }
  if (roles.includes('engineer')) {
    return <Navigate to="/engineer" replace />;
  }
  if (roles.includes('customer')) {
    return <Navigate to="/customer" replace />;
  }

  // Fallback — authenticated but unrecognised role combination
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md space-y-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Clock className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Account Pending Approval</h1>
          <p className="text-muted-foreground">
            Your account has been created successfully. An administrator will
            review and assign your role shortly. Please check back later.
          </p>
        </div>
        <div className="text-sm text-muted-foreground bg-muted rounded-lg p-3">
          Signed in as <span className="font-medium text-foreground">{user.email}</span>
        </div>
        <Button variant="outline" onClick={signOut} className="gap-2">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Index;
