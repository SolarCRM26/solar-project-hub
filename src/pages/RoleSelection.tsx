import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Wrench, Users, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const roleOptions = [
  {
    value: 'admin',
    label: 'Administrator',
    icon: Shield,
    description: 'Full access to manage projects, users, and system settings',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-900/30',
  },
  {
    value: 'engineer',
    label: 'Field Engineer',
    icon: Wrench,
    description: 'Access to tasks, logs, photos, and field operations',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20 hover:bg-orange-100 dark:hover:bg-orange-900/30',
  },
  {
    value: 'customer',
    label: 'Customer',
    icon: Users,
    description: 'View project progress, documents, and milestones',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-900/30',
  },
];

const RoleSelection = () => {
  const { user, roles } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Redirect if user already has roles
  useEffect(() => {
    if (roles && roles.length > 0) {
      navigate('/', { replace: true });
    }
  }, [roles, navigate]);

  const handleRoleSelection = async () => {
    if (!selectedRole || !user) return;

    setLoading(true);
    try {
      // Check if user already has this role
      const { data: existingRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', selectedRole as any);

      // Only insert if role doesn't exist
      if (!existingRoles || existingRoles.length === 0) {
        const { error } = await supabase.from('user_roles').insert({
          user_id: user.id,
          role: selectedRole as any,
        });

        if (error) throw error;
      }

      toast({ 
        title: 'Role assigned successfully!', 
        description: 'Redirecting to your dashboard...' 
      });

      // Refresh to update auth context with new role
      window.location.href = '/';
    } catch (error: any) {
      toast({ 
        title: 'Failed to assign role', 
        description: error.message, 
        variant: 'destructive' 
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl animate-slide-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to SPD Nexus</h1>
          <p className="text-muted-foreground">
            Please select your role to continue
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {roleOptions.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.value;

            return (
              <Card
                key={role.value}
                className={`cursor-pointer transition-all ${
                  isSelected 
                    ? 'ring-2 ring-primary shadow-lg' 
                    : 'hover:shadow-md'
                } ${role.bgColor}`}
                onClick={() => setSelectedRole(role.value)}
              >
                <CardHeader className="text-center pb-3">
                  <div className={`mx-auto w-16 h-16 rounded-full ${role.bgColor} flex items-center justify-center mb-3`}>
                    <Icon className={`h-8 w-8 ${role.color}`} />
                  </div>
                  <CardTitle className="text-xl">{role.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-sm">
                    {role.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleRoleSelection}
            disabled={!selectedRole || loading}
            className="min-w-[200px]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Assigning Role...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Select your role to access the appropriate dashboard
        </p>
      </div>
    </div>
  );
};

export default RoleSelection;
