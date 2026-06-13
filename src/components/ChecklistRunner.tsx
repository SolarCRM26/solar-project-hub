import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ChecklistItem } from "@/components/ChecklistItem";
import { ChecklistProgress } from "@/components/ChecklistProgress";
import { ListChecks, Play, Save, CheckCircle, Loader2 } from "lucide-react";

interface ChecklistRunnerProps {
  taskId: string;
  projectId: string;
}

interface ChecklistItemData {
  id: string;
  text: string;
  required: boolean;
  checked?: boolean;
  notes?: string;
}

export const ChecklistRunner = ({
  taskId,
  projectId,
}: ChecklistRunnerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [items, setItems] = useState<ChecklistItemData[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Tracks which run ID we've already loaded items from.
  // Once set, we won't reload from DB for the same run
  // (prevents background refetches from wiping local checkbox state).
  const initializedFromRunId = useRef<string | null>(null);

  // Fetch available templates
  const { data: templates = [] } = useQuery({
    queryKey: ["checklist-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("checklist_templates")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch existing checklist runs for this task
  const { data: existingRuns = [], isLoading: runsLoading } = useQuery({
    queryKey: ["checklist-runs", taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("checklist_runs")
        .select("*, checklist_templates(name)")
        .eq("task_id", taskId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!taskId,
  });

  // Active run: in_progress has priority; fall back to most recent completed run
  const activeRun =
    existingRuns.find((run: any) => run.status === "in_progress") ||
    existingRuns.find((run: any) => run.status === "completed");

  // ─────────────────────────────────────────────────────────────────────────
  // EFFECT 1: Sync items from active run.
  //
  // Only fires when activeRun.id or activeRun.status changes.
  // Uses `initializedFromRunId` ref to avoid overwriting local checkbox state
  // on every background refetch (which wouldn't change id/status anyway, but
  // we guard explicitly for safety).
  //
  //   • New run seen for first time  → load from DB
  //   • Same run, status flipped to 'completed' → re-sync (trigger fired)
  //   • Same run, status still 'in_progress' → DO NOTHING (keep local state)
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (runsLoading) return;
    if (!activeRun) return;

    const alreadyInitialized = initializedFromRunId.current === activeRun.id;

    if (!alreadyInitialized) {
      // First time we see this run — load from DB
      const completedItems = Array.isArray(activeRun.completed_items)
        ? (activeRun.completed_items as unknown as ChecklistItemData[])
        : [];
      setItems(completedItems);
      setSelectedTemplateId(activeRun.template_id);
      initializedFromRunId.current = activeRun.id;
    } else if (activeRun.status === "completed") {
      // DB trigger auto-completed the run — reload to show final checked state
      const completedItems = Array.isArray(activeRun.completed_items)
        ? (activeRun.completed_items as unknown as ChecklistItemData[])
        : [];
      setItems(completedItems);
    }
    // alreadyInitialized + in_progress → preserve local state
  }, [activeRun?.id, activeRun?.status, runsLoading]);

  // ─────────────────────────────────────────────────────────────────────────
  // EFFECT 2: Load template items when user picks a template (no run yet)
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeRun || runsLoading) return; // never override an existing run
    if (!selectedTemplateId) return;

    const template = templates.find((t: any) => t.id === selectedTemplateId);
    if (template) {
      const templateItems = Array.isArray(template.items)
        ? (template.items as unknown as ChecklistItemData[])
        : [];
      setItems(
        templateItems.map((item: any) => ({
          ...item,
          checked: false,
          notes: "",
        }))
      );
    }
  }, [selectedTemplateId, templates]);

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE RUN
  // ─────────────────────────────────────────────────────────────────────────
  const createRun = useMutation({
    mutationFn: async (itemsToSave: ChecklistItemData[]) => {
      if (!selectedTemplateId) throw new Error("No template selected");

      const { data, error } = await supabase
        .from("checklist_runs")
        .insert({
          task_id: taskId,
          project_id: projectId,
          template_id: selectedTemplateId,
          completed_items: itemsToSave as any,
          status: "in_progress",
          completed_by: user?.id,
        })
        .select("*, checklist_templates(name)")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, itemsToSave) => {
      // Mark this run as initialized so Effect 1 doesn't reload from DB
      initializedFromRunId.current = data.id;
      // Push new run into cache
      queryClient.setQueryData(["checklist-runs", taskId], (old: any) => {
        return old ? [data, ...old] : [data];
      });
      // Keep the items the user had when they clicked Save
      setItems(itemsToSave);
      setHasUnsavedChanges(false);
      toast({ title: "Checklist started" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SAVE PROGRESS
  // ─────────────────────────────────────────────────────────────────────────
  const saveProgress = useMutation({
    mutationFn: async (itemsToSave: ChecklistItemData[]) => {
      if (!activeRun || activeRun.status === "completed") {
        // No in_progress run: create one
        return createRun.mutateAsync(itemsToSave);
      }

      const { error } = await supabase
        .from("checklist_runs")
        .update({
          completed_items: itemsToSave as any,
          updated_at: new Date().toISOString(),
          completed_by: user?.id,
        })
        .eq("id", activeRun.id);

      if (error) throw error;

      // Return enough info for onSuccess
      return { savedRunId: activeRun.id };
    },
    onSuccess: (result, itemsToSave) => {
      if (!result) return; // handled by createRun.onSuccess

      // Optimistically patch the cache so the refetch's Effect 1 won't reload
      queryClient.setQueryData(["checklist-runs", taskId], (old: any) => {
        if (!old) return old;
        return old.map((run: any) =>
          run.id === (result as any).savedRunId
            ? { ...run, completed_items: itemsToSave }
            : run
        );
      });

      // Keep the checked state locally — do NOT wait for refetch
      setItems(itemsToSave);
      setHasUnsavedChanges(false);
      toast({ title: "Progress saved" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving progress",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // ─────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────
  const handleToggle = (id: string, checked: boolean) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked } : item))
    );
    setHasUnsavedChanges(true);
  };

  const handleNotesChange = (id: string, notes: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, notes } : item))
    );
    setHasUnsavedChanges(true);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // DERIVED STATE
  // ─────────────────────────────────────────────────────────────────────────
  const totalItems = items.length;
  const completedItemsCount = items.filter((item) => item.checked).length;
  const requiredItems = items.filter((item) => item.required).length;
  const completedRequiredItems = items.filter(
    (item) => item.required && item.checked
  ).length;
  const allRequiredComplete =
    requiredItems > 0 && requiredItems === completedRequiredItems;
  const isComplete = activeRun?.status === "completed";
  const inProgressRun = existingRuns.find(
    (run: any) => run.status === "in_progress"
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ListChecks className="h-4 w-4 mr-2" />
          {inProgressRun
            ? "Continue Checklist"
            : isComplete
            ? "View Checklist"
            : "Run Checklist"}
          {inProgressRun && (
            <Badge variant="secondary" className="ml-2">
              In Progress
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            {activeRun ? "Checklist in Progress" : "Start Checklist"}
          </DialogTitle>
          <DialogDescription>
            {activeRun
              ? "Complete all required items to finish the checklist"
              : "Select a checklist template to begin"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Selection — only when no run exists */}
          {!activeRun && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Select Checklist Template
              </label>
              <Select
                value={selectedTemplateId}
                onValueChange={setSelectedTemplateId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template: any) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                      {template.description && (
                        <span className="text-xs text-muted-foreground ml-2">
                          - {template.description}
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Active run header */}
          {activeRun && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {(activeRun as any).checklist_templates?.name}
                  </CardTitle>
                  {isComplete ? (
                    <Badge variant="default" className="bg-amber-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  ) : (
                    <Badge variant="secondary">In Progress</Badge>
                  )}
                </div>
              </CardHeader>
            </Card>
          )}

          {/* Progress bar */}
          {items.length > 0 && (
            <ChecklistProgress
              totalItems={totalItems}
              completedItems={completedItemsCount}
              requiredItems={requiredItems}
              completedRequiredItems={completedRequiredItems}
            />
          )}

          <Separator />

          {/* Checklist Items */}
          {items.length > 0 ? (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {items.map((item) => (
                  <ChecklistItem
                    key={item.id}
                    item={item}
                    onToggle={handleToggle}
                    onNotesChange={handleNotesChange}
                    disabled={isComplete}
                  />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <ListChecks className="h-12 w-12 mb-3 opacity-50" />
              <p>Select a template to start a checklist</p>
            </div>
          )}

          {/* Action buttons */}
          {items.length > 0 && !isComplete && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {hasUnsavedChanges && (
                  <span className="text-amber-600 dark:text-amber-400">
                    • Unsaved changes
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => saveProgress.mutate(items)}
                  disabled={!hasUnsavedChanges || saveProgress.isPending}
                >
                  {saveProgress.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Progress
                </Button>
                {!activeRun && (
                  <Button
                    onClick={() => createRun.mutate(items)}
                    disabled={!selectedTemplateId || createRun.isPending}
                  >
                    {createRun.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Start Checklist
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* "Not all required done" hint */}
          {!allRequiredComplete && items.length > 0 && !isComplete && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm">
              <div className="flex items-start gap-2">
                <Play className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                <p className="text-amber-900 dark:text-amber-100">
                  Complete all <strong>{requiredItems}</strong> required items
                  to finish this checklist.
                  {completedRequiredItems > 0 &&
                    ` (${completedRequiredItems}/${requiredItems} done)`}
                </p>
              </div>
            </div>
          )}

          {/* Completed banner */}
          {isComplete && activeRun?.completed_at && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                <p className="text-amber-900 dark:text-amber-100">
                  Checklist completed on{" "}
                  {new Date(activeRun.completed_at).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
