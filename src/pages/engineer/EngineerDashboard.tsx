import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StageBadge, StatusBadge } from '@/components/StatusBadges';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HardHat, FolderKanban } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EngineerDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: assignments = [] } = useQuery({
    queryKey: ['my-assignments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_assignments')
        .select('*, projects(id, name, stage, project_type, capacity_kw)')
        .eq('user_id', user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const projectIds = assignments.map(a => (a as any).projects?.id).filter(Boolean);

  const { data: tasks = [] } = useQuery({
    queryKey: ['my-tasks', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, projects(name)')
        .eq('assigned_to', user!.id)
        .order('due_date', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('tasks').update({
        status: status as any,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      toast({ title: 'Task updated' });
    },
  });

  const projects = assignments.map(a => (a as any).projects).filter(Boolean);

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <HardHat className="h-8 w-8 text-primary" /> Field Engineer
        </h1>
        <p className="text-muted-foreground mt-1">Your assigned projects and tasks</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Assigned Projects</CardTitle>
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{projects.length}</div></CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Open Tasks</CardTitle>
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{tasks.filter(t => t.status !== 'completed').length}</div></CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Completed Tasks</CardTitle>
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{tasks.filter(t => t.status === 'completed').length}</div></CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><FolderKanban className="h-5 w-5" /> My Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Capacity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No assigned projects</TableCell></TableRow>
              ) : (
                projects.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="capitalize">{p.project_type?.replace('_', ' ')}</TableCell>
                    <TableCell><StageBadge stage={p.stage} /></TableCell>
                    <TableCell>{p.capacity_kw ? `${p.capacity_kw} kW` : '—'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">My Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No tasks assigned</TableCell></TableRow>
              ) : (
                tasks.map(task => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>{(task as any).projects?.name || '—'}</TableCell>
                    <TableCell><StatusBadge status={task.status} /></TableCell>
                    <TableCell>{task.due_date || '—'}</TableCell>
                    <TableCell>
                      <Select value={task.status} onValueChange={v => updateTask.mutate({ id: task.id, status: v })}>
                        <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
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

export default EngineerDashboard;
