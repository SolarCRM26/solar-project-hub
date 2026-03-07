import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StageBadge, stageLabels } from '@/components/StatusBadges';
import { ArrowLeft, Save, Plus, UserPlus, Milestone, X, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const projectTypes = [
  { value: 'rooftop', label: 'Rooftop' },
  { value: 'ground_mount', label: 'Ground Mount' },
  { value: 'carport', label: 'Carport' },
];

const stages = Object.entries(stageLabels).map(([value, label]) => ({ value, label }));

const AdminProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);

  const [form, setForm] = useState({
    name: '', description: '', project_type: 'rooftop', stage: 'lead_created',
    capacity_kw: '', estimated_cost: '', start_date: '', target_completion: '',
    client_id: '', site_id: '', organization_id: '',
  });

  const [teamForm, setTeamForm] = useState({ user_id: '', role: 'engineer' });
  const [milestoneForm, setMilestoneForm] = useState({
    name: '', description: '', due_date: '', stage: '', sort_order: '0',
  });

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;

      // Populate form
      setForm({
        name: data.name,
        description: data.description || '',
        project_type: data.project_type,
        stage: data.stage,
        capacity_kw: data.capacity_kw?.toString() || '',
        estimated_cost: data.estimated_cost?.toString() || '',
        start_date: data.start_date || '',
        target_completion: data.target_completion || '',
        client_id: data.client_id || '',
        site_id: data.site_id || '',
        organization_id: data.organization_id || '',
      });

      return data;
    },
    enabled: !!id,
  });

  const { data: team = [] } = useQuery({
    queryKey: ['project-team', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_assignments')
        .select('*, profiles(full_name, email)')
        .eq('project_id', id!);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ['project-milestones', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('project_id', id!)
        .order('sort_order');
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users-for-assignment'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('user_id, full_name, email').order('full_name');
      if (error) throw error;
      return data;
    },
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers-list'],
    queryFn: async () => {
      // Fetch users who have the 'customer' role
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

  const { data: sites = [] } = useQuery({
    queryKey: ['sites-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('sites').select('id, name').order('name');
      if (error) throw error;
      return data;
    },
  });

  const updateProject = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('projects').update({
        name: form.name,
        description: form.description || null,
        project_type: form.project_type as any,
        stage: form.stage as any,
        capacity_kw: form.capacity_kw ? parseFloat(form.capacity_kw) : null,
        estimated_cost: form.estimated_cost ? parseFloat(form.estimated_cost) : null,
        start_date: form.start_date || null,
        target_completion: form.target_completion || null,
        client_id: form.client_id || null,
        site_id: form.site_id || null,
        organization_id: form.organization_id || null,
      }).eq('id', id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: 'Project updated' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const addTeamMember = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('project_assignments').insert({
        project_id: id!,
        user_id: teamForm.user_id,
        role: teamForm.role as any,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-team', id] });
      setTeamDialogOpen(false);
      setTeamForm({ user_id: '', role: 'engineer' });
      toast({ title: 'Team member added' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const removeTeamMember = useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase.from('project_assignments').delete().eq('id', assignmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-team', id] });
      toast({ title: 'Team member removed' });
    },
  });

  const addMilestone = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('milestones').insert({
        project_id: id!,
        name: milestoneForm.name,
        description: milestoneForm.description || null,
        due_date: milestoneForm.due_date || null,
        stage: milestoneForm.stage || null,
        sort_order: parseInt(milestoneForm.sort_order),
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-milestones', id] });
      setMilestoneDialogOpen(false);
      setMilestoneForm({ name: '', description: '', due_date: '', stage: '', sort_order: '0' });
      toast({ title: 'Milestone added' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const completeMilestone = useMutation({
    mutationFn: async (milestoneId: string) => {
      const { error } = await supabase.from('milestones').update({
        completed_at: new Date().toISOString(),
      }).eq('id', milestoneId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-milestones', id] });
      toast({ title: 'Milestone completed' });
    },
  });

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!project) return <div className="p-6">Project not found</div>;

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/admin/projects')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Projects
        </Button>
        <Button onClick={() => updateProject.mutate()} disabled={updateProject.isPending}>
          <Save className="h-4 w-4 mr-2" /> Save Changes
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <div className="flex items-center gap-2 mt-2">
          <StageBadge stage={project.stage} />
          <span className="text-sm text-muted-foreground">Project ID: {project.id}</span>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="team">Team ({team.length})</TabsTrigger>
          <TabsTrigger value="milestones">Milestones ({milestones.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Stage</Label>
                  <Select value={form.stage} onValueChange={v => setForm(f => ({ ...f, stage: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{stages.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={form.project_type} onValueChange={v => setForm(f => ({ ...f, project_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{projectTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
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
                  <Label>Client</Label>
                  <Select value={form.client_id || "none"} onValueChange={v => setForm(f => ({ ...f, client_id: v === 'none' ? '' : v }))}>
                    <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {customers.map(c => <SelectItem key={c.user_id} value={c.user_id}>{c.full_name || c.email}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Site</Label>
                  <Select value={form.site_id || "none"} onValueChange={v => setForm(f => ({ ...f, site_id: v === 'none' ? '' : v }))}>
                    <SelectTrigger><SelectValue placeholder="Select site" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {sites.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Team Members</CardTitle>
              <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><UserPlus className="h-4 w-4 mr-2" /> Add Member</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={e => { e.preventDefault(); addTeamMember.mutate(); }} className="space-y-4">
                    <div className="space-y-2">
                      <Label>User</Label>
                      <Select value={teamForm.user_id} onValueChange={v => setTeamForm(f => ({ ...f, user_id: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                        <SelectContent>
                          {users.map(u => <SelectItem key={u.user_id} value={u.user_id}>{u.full_name || u.email}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select value={teamForm.role} onValueChange={v => setTeamForm(f => ({ ...f, role: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="project_manager">Project Manager</SelectItem>
                          <SelectItem value="engineer">Engineer</SelectItem>
                          <SelectItem value="qa_manager">QA Manager</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full" disabled={addTeamMember.isPending || !teamForm.user_id}>
                      {addTeamMember.isPending ? 'Adding...' : 'Add to Team'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {team.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No team members assigned</TableCell></TableRow>
                  ) : (
                    team.map(member => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{(member as any).profiles?.full_name || '—'}</TableCell>
                        <TableCell>{(member as any).profiles?.email}</TableCell>
                        <TableCell><Badge variant="secondary" className="capitalize">{member.role.replace('_', ' ')}</Badge></TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => removeTeamMember.mutate(member.id)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Project Milestones</CardTitle>
              <Dialog open={milestoneDialogOpen} onOpenChange={setMilestoneDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Add Milestone</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Milestone</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={e => { e.preventDefault(); addMilestone.mutate(); }} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Milestone Name</Label>
                      <Input value={milestoneForm.name} onChange={e => setMilestoneForm(f => ({ ...f, name: e.target.value }))} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea value={milestoneForm.description} onChange={e => setMilestoneForm(f => ({ ...f, description: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Due Date</Label>
                        <Input type="date" value={milestoneForm.due_date} onChange={e => setMilestoneForm(f => ({ ...f, due_date: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>Sort Order</Label>
                        <Input type="number" value={milestoneForm.sort_order} onChange={e => setMilestoneForm(f => ({ ...f, sort_order: e.target.value }))} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Related Stage</Label>
                      <Select value={milestoneForm.stage || "none"} onValueChange={v => setMilestoneForm(f => ({ ...f, stage: v === 'none' ? '' : v }))}>
                        <SelectTrigger><SelectValue placeholder="Select stage (optional)" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {stages.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full" disabled={addMilestone.isPending}>
                      {addMilestone.isPending ? 'Creating...' : 'Create Milestone'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {milestones.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No milestones created</p>
                ) : (
                  milestones.map(milestone => (
                    <div key={milestone.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Milestone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{milestone.name}</p>
                          {milestone.description && <p className="text-sm text-muted-foreground">{milestone.description}</p>}
                          {milestone.due_date && (
                            <p className="text-xs text-muted-foreground mt-1">Due: {new Date(milestone.due_date).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {milestone.stage && <StageBadge stage={milestone.stage} />}
                        {milestone.completed_at ? (
                          <Badge variant="default" className="bg-green-500/20 text-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" /> Completed
                          </Badge>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => completeMilestone.mutate(milestone.id)}>
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminProjectDetail;
