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
    start_date: '', target_completion: '', client_id: '',
  });

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase.from('projects').select('*, profiles!projects_client_id_fkey(full_name)').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers-list'],
    queryFn: async () => {
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'customer');
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
      const { error } = await supabase.from('projects').insert({
        name: form.name,
        description: form.description || null,
        project_type: form.project_type as any,
        stage: form.stage as any,
        capacity_kw: form.capacity_kw ? parseFloat(form.capacity_kw) : null,
        estimated_cost: form.estimated_cost ? parseFloat(form.estimated_cost) : null,
        start_date: form.start_date || null,
        target_completion: form.target_completion || null,
        client_id: form.client_id || null,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setOpen(false);
      setForm({ name: '', description: '', project_type: 'rooftop', stage: 'lead_created', capacity_kw: '', estimated_cost: '', start_date: '', target_completion: '', client_id: '' });
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
              <div className="space-y-2">
                <Label>Client (Customer User)</Label>
                <Select value={form.client_id} onValueChange={v => setForm(f => ({ ...f, client_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {customers.map(c => <SelectItem key={c.user_id} value={c.user_id}>{c.full_name || c.email}</SelectItem>)}
                  </SelectContent>
                </Select>
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
                    <TableCell>{(project as any).profiles?.full_name || '—'}</TableCell>
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
