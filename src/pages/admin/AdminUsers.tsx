import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Users, Search, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type AppRole = 'admin' | 'engineer' | 'customer';

const roleLabels: Record<AppRole, string> = {
  admin: 'Admin',
  engineer: 'Field Engineer',
  customer: 'Customer',
};

const roleColors: Record<AppRole, string> = {
  admin: 'bg-red-500/20 text-red-700 dark:text-red-300',
  engineer: 'bg-green-500/20 text-green-700 dark:text-green-300',
  customer: 'bg-orange-500/20 text-orange-700 dark:text-orange-300',
};

const AdminUsers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
  });

  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([]);

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const userRolesMap = roles.reduce((acc: Record<string, string[]>, r: any) => {
        if (!acc[r.user_id]) acc[r.user_id] = [];
        acc[r.user_id].push(r.role);
        return acc;
      }, {});

      return profiles.map(p => ({
        ...p,
        roles: userRolesMap[p.user_id] || [],
      }));
    },
  });

  const createUser = useMutation({
    mutationFn: async () => {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: form.full_name },
          emailRedirectTo: window.location.origin,
        },
      });

      if (authError) throw authError;
      return authData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setOpen(false);
      setForm({ email: '', password: '', full_name: '' });
      toast({ title: 'User created', description: 'User has been invited via email' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const updateUserRoles = useMutation({
    mutationFn: async () => {
      if (!selectedUser) return;

      // Delete existing roles
      await supabase.from('user_roles').delete().eq('user_id', selectedUser.user_id);

      // Insert new roles
      if (selectedRoles.length > 0) {
        const { error } = await supabase.from('user_roles').insert(
          selectedRoles.map(role => ({ user_id: selectedUser.user_id, role }))
        );
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setRoleDialogOpen(false);
      setSelectedUser(null);
      setSelectedRoles([]);
      toast({ title: 'Roles updated' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const openRoleDialog = (user: any) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles || []);
    setRoleDialogOpen(true);
  };

  const toggleRole = (role: AppRole) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" /> User Management
          </h1>
          <p className="text-muted-foreground mt-1">{users.length} total users</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Invite User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={e => { e.preventDefault(); createUser.mutate(); }} className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Initial Password</Label>
                <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              </div>
              <p className="text-xs text-muted-foreground">
                User will receive an email confirmation. Assign roles after creation.
              </p>
              <Button type="submit" className="w-full" disabled={createUser.isPending}>
                {createUser.isPending ? 'Creating...' : 'Create User'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No users found</TableCell></TableRow>
              ) : (
                filtered.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name || '—'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length === 0 ? (
                          <span className="text-xs text-muted-foreground">No roles assigned</span>
                        ) : (
                          user.roles.map((role: AppRole) => (
                            <Badge key={role} variant="secondary" className={roleColors[role]}>
                              {roleLabels[role]}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => openRoleDialog(user)}>
                        <Shield className="h-3 w-3 mr-1" /> Manage Roles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Roles: {selectedUser?.full_name || selectedUser?.email}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Select roles for this user:</p>
            {Object.entries(roleLabels).map(([role, label]) => (
              <div key={role} className="flex items-center space-x-2">
                <Checkbox
                  id={role}
                  checked={selectedRoles.includes(role as AppRole)}
                  onCheckedChange={() => toggleRole(role as AppRole)}
                />
                <Label htmlFor={role} className="cursor-pointer flex items-center gap-2">
                  <Badge variant="secondary" className={roleColors[role as AppRole]}>
                    {label}
                  </Badge>
                </Label>
              </div>
            ))}
            <Button onClick={() => updateUserRoles.mutate()} className="w-full" disabled={updateUserRoles.isPending}>
              {updateUserRoles.isPending ? 'Saving...' : 'Save Roles'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
