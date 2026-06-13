import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/StatusBadges";
import {
  Plus,
  ListTodo,
  Search,
  MessageSquare,
  CheckSquare,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TaskComments } from "@/components/TaskComments";
import { ChecklistRunner } from "@/components/ChecklistRunner";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

const AdminTasks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<any>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    project_id: "",
    status: "pending" as string,
    priority: "0",
    due_date: "",
    assigned_to: "",
    checklist_template_id: "",
  });

  const [taskDetailOpen, setTaskDetailOpen] = useState(false);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*, projects(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Fetch assigned user profiles separately
      const assignedUserIds = [
        ...new Set(data.map((t) => t.assigned_to).filter(Boolean)),
      ];

      if (assignedUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, email")
          .in("user_id", assignedUserIds);

        const profilesMap =
          profiles?.reduce((acc: any, p: any) => {
            acc[p.user_id] = p;
            return acc;
          }, {}) || {};

        return data.map((task) => ({
          ...task,
          profile: task.assigned_to ? profilesMap[task.assigned_to] : null,
        }));
      }

      return data.map((task) => ({ ...task, profile: null }));
    },
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: checklistTemplates = [] } = useQuery({
    queryKey: ["checklist-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("checklist_templates")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: selectedTaskRuns = [], isLoading: selectedTaskRunsLoading } = useQuery({
    queryKey: ["task-checklist-runs", selectedTask?.id],
    queryFn: async () => {
      if (!selectedTask?.id) return [];
      const { data, error } = await supabase
        .from("checklist_runs")
        .select("*, checklist_templates(name)")
        .eq("task_id", selectedTask.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedTask?.id,
  });

  // Fetch all profiles for assignment
  const { data: engineers = [] } = useQuery({
    queryKey: ["all-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .order("full_name");

      if (error) throw error;
      return data;
    },
  });

  const createTask = useMutation({
    mutationFn: async () => {
      const { data: newTask, error } = await supabase
        .from("tasks")
        .insert({
          title: form.title,
          description: form.description || null,
          project_id: form.project_id,
          status: form.status as any,
          priority: parseInt(form.priority),
          due_date: form.due_date || null,
          assigned_to: form.assigned_to || null,
          created_by: user?.id,
        })
        .select("id")
        .single();
      
      if (error) throw error;

      if (form.checklist_template_id && form.checklist_template_id !== "none" && newTask) {
        const { data: template, error: templateError } = await supabase
          .from("checklist_templates")
          .select("items")
          .eq("id", form.checklist_template_id)
          .single();

        if (templateError) throw templateError;

        const templateItems = Array.isArray(template?.items)
          ? template.items
          : [];

        const formattedItems = templateItems.map((item: any) => ({
          ...item,
          checked: false,
          notes: "",
        }));

        const { error: runError } = await supabase
          .from("checklist_runs")
          .insert({
            task_id: newTask.id,
            project_id: form.project_id,
            template_id: form.checklist_template_id,
            completed_items: formattedItems as any,
            status: "in_progress",
          });

        if (runError) throw runError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setOpen(false);
      setForm({
        title: "",
        description: "",
        project_id: "",
        status: "pending",
        priority: "0",
        due_date: "",
        assigned_to: "",
        checklist_template_id: "",
      });
      toast({ title: "Task created and assigned" });
    },
    onError: (e: any) =>
      toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      // Step 2: Query task_photos for target task
      const { data: photosData, error: photosError } = await supabase
        .from("task_photos")
        .select("file_path")
        .eq("task_id", taskId);

      if (photosError) {
        throw new Error(`Failed to query task photos: ${photosError.message}`);
      }

      // Step 3: Delete storage files from project-documents
      if (photosData && photosData.length > 0) {
        const filePaths = photosData.map((p) => p.file_path);
        const { error: storageError } = await supabase.storage
          .from("project-documents")
          .remove(filePaths);

        if (storageError) {
          throw new Error(`Failed to delete task photo files: ${storageError.message}`);
        }
      }

      // Step 4: Delete task row
      const { error: deleteError } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

      if (deleteError) {
        throw new Error(`Failed to delete task: ${deleteError.message}`);
      }
    },
    onSuccess: () => {
      // Step 5: Refresh UI
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({ title: "Task deleted successfully" });
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    },
    onError: (e: any) => {
      // Step 6: Handle Errors
      toast({
        title: "Delete failed",
        description: e.message,
        variant: "destructive",
      });
    },
  });

  const filtered = tasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openCommentsDialog = (task: any) => {
    setSelectedTask(task);
    setCommentsDialogOpen(true);
  };

  if (isLoading) return <LoadingSpinner text="Loading tasks..." />;

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ListTodo className="h-8 w-8 text-primary" /> Tasks
          </h1>
          <p className="text-muted-foreground mt-1">
            {tasks.length} total tasks
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> New Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createTask.mutate();
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Project</Label>
                <Select
                  value={form.project_id}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, project_id: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Associated Checklist (Optional)</Label>
                <Select
                  value={form.checklist_template_id || "none"}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, checklist_template_id: v === "none" ? "" : v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select checklist template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {checklistTemplates.map((t: any) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assign To</Label>
                <Select
                  value={form.assigned_to}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      assigned_to: v === "unassigned" ? "" : v,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {engineers.map((e) => (
                      <SelectItem key={e.user_id} value={e.user_id}>
                        {e.full_name} ({e.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority (0-5)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    value={form.priority}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, priority: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={form.due_date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, due_date: e.target.value }))
                    }
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createTask.isPending || !form.project_id}
              >
                {createTask.isPending ? "Creating..." : "Create Task"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <EmptyState
                      icon={CheckSquare}
                      title="No tasks found"
                      description="Create your first task to start tracking work or adjust your search"
                      actionLabel="Create Task"
                      onAction={() => setOpen(true)}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div 
                        className="cursor-pointer hover:underline"
                        onClick={() => {
                          setSelectedTask(task);
                          setTaskDetailOpen(true);
                        }}
                      >
                        <p className="font-medium text-primary">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-xs">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{(task as any).projects?.name || "—"}</TableCell>
                    <TableCell>
                      {(task as any).profile ? (
                        <div>
                          <p className="text-sm font-medium">
                            {(task as any).profile.full_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(task as any).profile.email}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Unassigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={task.status} />
                    </TableCell>
                    <TableCell>
                      <span
                        className={`font-mono text-sm ${task.priority >= 4 ? "text-destructive" : task.priority >= 2 ? "text-warning" : "text-muted-foreground"}`}
                      >
                        P{task.priority}
                      </span>
                    </TableCell>
                    <TableCell>{task.due_date || "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <ChecklistRunner
                          taskId={task.id}
                          projectId={task.project_id}
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => openCommentsDialog(task)}
                            >
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Open Comments
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(`/admin/projects/${task.project_id}`)
                              }
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Open Project
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                setTaskToDelete(task);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Task
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={commentsDialogOpen} onOpenChange={setCommentsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Task: {selectedTask?.title}</DialogTitle>
          </DialogHeader>
          {selectedTask && <TaskComments taskId={selectedTask.id} />}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All related comments and task photos will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (taskToDelete) {
                  deleteTask.mutate(taskToDelete.id);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTask.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={taskDetailOpen} onOpenChange={setTaskDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Task Details: {selectedTask?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground">Description</h4>
              <p className="text-sm mt-1 whitespace-pre-wrap">
                {selectedTask?.description || "No description provided."}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground">Assigned To</h4>
                <p className="text-sm mt-1">
                  {selectedTask?.profile 
                    ? `${selectedTask.profile.full_name || "Unknown"} (${selectedTask.profile.email})`
                    : "Unassigned"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground">Project</h4>
                <p className="text-sm mt-1">
                  {selectedTask?.projects?.name || "None"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground">Status</h4>
                <div className="mt-1">
                  <StatusBadge status={selectedTask?.status} />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground">Priority</h4>
                <p className="text-sm mt-1 font-mono">
                  P{selectedTask?.priority}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-muted-foreground">Associated Checklist Progress</h4>
              {selectedTaskRunsLoading ? (
                <p className="text-sm text-muted-foreground mt-1">Loading checklist details...</p>
              ) : selectedTaskRuns.length > 0 ? (
                <div className="space-y-3 mt-2">
                  {selectedTaskRuns.map((run: any) => {
                    const runItems = Array.isArray(run.completed_items) ? run.completed_items : [];
                    const completedCount = runItems.filter((i: any) => i.checked).length;
                    const totalCount = runItems.length;
                    return (
                      <div key={run.id} className="border border-border/60 rounded-lg p-3 bg-muted/20">
                        <div className="flex justify-between items-center text-sm font-medium">
                          <span>{run.checklist_templates?.name || "Checklist"}</span>
                          <span className="text-muted-foreground font-mono text-xs">
                            {completedCount} / {totalCount} Completed
                          </span>
                        </div>
                        <div className="mt-2 space-y-1">
                          {runItems.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              <span className={item.checked ? "text-green-600 font-bold" : "text-muted-foreground"}>
                                {item.checked ? "✓" : "○"}
                              </span>
                              <span className={item.checked ? "line-through text-muted-foreground" : ""}>
                                {item.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">No checklist runs associated with this task.</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTasks;
