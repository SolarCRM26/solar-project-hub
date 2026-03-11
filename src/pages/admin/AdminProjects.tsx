import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { StageBadge, stageLabels } from '@/components/StatusBadges';
import { Plus, FolderKanban, Search, FolderOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';

const projectTypes = [
  { value: 'rooftop', label: 'Rooftop' },
  { value: 'ground_mount', label: 'Ground Mount' },
  { value: 'carport', label: 'Carport' },
];

const stages = Object.entries(stageLabels).map(([value, label]) => ({ value, label }));

const AdminProjects = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState<string>('all');

  const [form, setForm] = useState({
    name: '', description: '', project_type: 'rooftop' as string,
    stage: 'lead_created' as string, capacity_kw: '', estimated_cost: '',
    start_date: '', target_completion: '', client_id: '', engineer_id: '',
  });

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers-list'],
    queryFn: async () => {
      // Fetch all users with 'customer' role
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles').select('user_id').eq('role', 'customer');
      if (roleError) throw roleError;
      if (!userRoles || userRoles.length === 0) return [];

      const userIds = userRoles.map(ur => ur.user_id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles').select('user_id, full_name, email').in('user_id', userIds).order('full_name');
      if (profileError) throw profileError;
      
      return (profiles || []).map(p => ({
        user_id: p.user_id,
        name: p.full_name || p.email || 'Unknown Customer',
        email: p.email
      }));
    },
  });

  const { data: engineers = [] } = useQuery({
    queryKey: ['engineers-list'],
    queryFn: async () => {
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'engineer');
      if (roleError) throw roleError;
      if (!userRoles || userRoles.length === 0) return [];

      const userIds = userRoles.map(ur => ur.user_id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', userIds)
        .order('full_name');
      if (profileError) throw profileError;
      return profiles;
    },
  });

  const createProject = useMutation({
    mutationFn: async () => {
      try {
        // Resolve clients.id securely on the backend, bypassing any JS cache bugs
        let resolvedClientId: string | null = null;
        if (form.client_id && form.client_id !== 'none') {
          // Use .limit(1) to prevent "multiple rows returned" errors if duplicate clients exist
          const { data: existingClient, error: existError } = await supabase
            .from('clients')
            .select('id')
            .eq('user_id', form.client_id)
            .limit(1)
            .maybeSingle();

          if (existError) {
            console.error('Error fetching client by user_id:', existError);
            throw new Error(`DB Error on client lookup: ${existError.message}`);
          }

          if (existingClient?.id) {
            resolvedClientId = existingClient.id;
          } else {
            // Auto-create missing client record for this customer
            const selectedCustomer = customers.find(c => c.user_id === form.client_id);
            const { data: newClient, error: clientError } = await supabase
              .from('clients')
              .insert({
                name: selectedCustomer?.name || 'Customer',
                email: selectedCustomer?.email || null,
                user_id: form.client_id,
              })
              .select('id')
              .single();
              
            if (clientError) {
              console.error('Error inserting new client:', clientError);
              throw new Error(`DB Error creating client profile: ${clientError.message}`);
            }
            resolvedClientId = newClient.id;
          }
        }

        // VERIFICATION PRE-FLIGHT
        if (resolvedClientId) {
          const { data: sanityCheck, error: sanityError } = await supabase
            .from('clients')
            .select('id, user_id')
            .eq('id', resolvedClientId)
            .maybeSingle();
            
          if (!sanityCheck) {
            console.error('PRE-FLIGHT FAILED: The resolved client ID does not exist in the clients table!', {
              resolvedClientId,
              sanityError
            });
            throw new Error(`CRITICAL BUG: Client ID ${resolvedClientId} vanished before project insert! Supabase glitch?`);
          }
          console.log('PRE-FLIGHT PASSED: Client exists.', sanityCheck);
        }

        const projectPayload = {
          name: form.name,
          description: form.description || null,
          project_type: form.project_type as any,
          stage: form.stage as any,
          capacity_kw: form.capacity_kw ? parseFloat(form.capacity_kw) : null,
          estimated_cost: form.estimated_cost ? parseFloat(form.estimated_cost) : null,
          start_date: form.start_date || null,
          target_completion: form.target_completion || null,
          client_id: resolvedClientId || null, // ensure empty string becomes null
          created_by: user?.id,
        };

        console.log('Inserting project payload:', projectPayload);

        const { data: project, error: projectError } = await supabase.from('projects')
          .insert(projectPayload)
          .select()
          .single();
          
        if (projectError) {
          console.error('Error inserting project:', projectError);
          // Append the resolved client_id to the error message so the UI toast shows us EXACTLY what was sent!
          throw new Error(`Project Insert Failed: ${projectError.message}. [Debug payload_client_id: ${resolvedClientId || 'null'}]`);
        }

        // Assign engineer if selected
        if (form.engineer_id && form.engineer_id !== 'none' && project) {
          const { error: assignError } = await supabase.from('project_assignments').insert({
            project_id: project.id,
            user_id: form.engineer_id,
            role: 'engineer',
          });
          if (assignError) {
            console.error('Error assigning engineer:', assignError);
            throw new Error(`Project created but engineer attach failed: ${assignError.message}`);
          }
        }
        
        return project;
      } catch (err: any) {
        console.error('Create project top-level catch:', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setOpen(false);
      setForm({ name: '', description: '', project_type: 'rooftop', stage: 'lead_created', capacity_kw: '', estimated_cost: '', start_date: '', target_completion: '', client_id: '', engineer_id: '' });
      toast({ title: 'Project created' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchStage = filterStage === 'all' || p.stage === filterStage;
    return matchSearch && matchStage;
  });

  if (isLoading) return <div className="flex items-center justify-center h-64">Loading projects...</div>;

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FolderKanban className="h-8 w-8 text-primary" /> Projects
          </h1>
          <p className="text-muted-foreground mt-1">{projects.length} total projects</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> New Project</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={e => { e.preventDefault(); createProject.mutate(); }} className="space-y-4">
              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={form.project_type} onValueChange={v => setForm(f => ({ ...f, project_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{projectTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Stage</Label>
                  <Select value={form.stage} onValueChange={v => setForm(f => ({ ...f, stage: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{stages.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Capacity (kW)</Label>
                  <Input type="number" value={form.capacity_kw} onChange={e => setForm(f => ({ ...f, capacity_kw: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Estimated Cost ($)</Label>
                  <Input type="number" value={form.estimated_cost} onChange={e => setForm(f => ({ ...f, estimated_cost: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Target Completion</Label>
                  <Input type="date" value={form.target_completion} onChange={e => setForm(f => ({ ...f, target_completion: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client (Customer User)</Label>
                  <Select value={form.client_id || "none"} onValueChange={v => setForm(f => ({ ...f, client_id: v === 'none' ? '' : v }))}>
                    <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {customers.map(c => <SelectItem key={c.user_id} value={c.user_id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assign Engineer</Label>
                  <Select value={form.engineer_id || "none"} onValueChange={v => setForm(f => ({ ...f, engineer_id: v === 'none' ? '' : v }))}>
                    <SelectTrigger><SelectValue placeholder="Select engineer" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {engineers.map(e => <SelectItem key={e.user_id} value={e.user_id}>{e.full_name || e.email}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createProject.isPending}>
                {createProject.isPending ? 'Creating...' : 'Create Project'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterStage} onValueChange={setFilterStage}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filter by stage" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {stages.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Target</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <EmptyState
                      icon={FolderOpen}
                      title="No projects found"
                      description="Create your first project to get started or adjust your search filters"
                      actionLabel="Create Project"
                      onAction={() => setOpen(true)}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(project => (
                  <TableRow key={project.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/admin/projects/${project.id}`)}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{projects.find(p => p.id === project.id)?.client_id ? 'View Details' : '—'}</TableCell>
                    <TableCell className="capitalize">{project.project_type?.replace('_', ' ')}</TableCell>
                    <TableCell><StageBadge stage={project.stage} /></TableCell>
                    <TableCell>{project.capacity_kw ? `${project.capacity_kw} kW` : '—'}</TableCell>
                    <TableCell>{project.target_completion || '—'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProjects;
