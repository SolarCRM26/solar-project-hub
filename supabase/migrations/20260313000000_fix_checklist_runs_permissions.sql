-- Fix checklist_runs permissions and auto-complete trigger
-- This SQL can be executed in the Supabase SQL editor to apply the fixes without losing data

-- 1. Recreate RLS Policy for checklist_runs to be robust and allow assigned engineers
DROP POLICY IF EXISTS "Users manage checklist runs" ON public.checklist_runs;

CREATE POLICY "Users manage checklist runs" ON public.checklist_runs 
FOR ALL 
TO authenticated 
USING (
  public.has_role(auth.uid(), 'admin') 
  OR public.has_role(auth.uid(), 'project_manager') 
  OR completed_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = checklist_runs.task_id 
    AND tasks.assigned_to = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.project_assignments 
    WHERE project_assignments.project_id = checklist_runs.project_id 
    AND project_assignments.user_id = auth.uid()
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') 
  OR public.has_role(auth.uid(), 'project_manager') 
  OR completed_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = checklist_runs.task_id 
    AND tasks.assigned_to = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.project_assignments 
    WHERE project_assignments.project_id = checklist_runs.project_id 
    AND project_assignments.user_id = auth.uid()
  )
);

-- 2. Fix the auto-complete trigger to assign UUID directly without casting to text
CREATE OR REPLACE FUNCTION public.auto_complete_checklist()
RETURNS TRIGGER AS $$
DECLARE
  v_template_items JSONB;
  v_completed_items JSONB;
  v_total_required INTEGER;
  v_completed_count INTEGER;
BEGIN
  -- Get template items
  SELECT items INTO v_template_items 
  FROM public.checklist_templates 
  WHERE id = NEW.template_id;
  
  -- If there's no template (e.g. project installation checklist), we don't auto-complete this way
  IF v_template_items IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Count required items
  SELECT COUNT(*) INTO v_total_required
  FROM jsonb_array_elements(v_template_items) item
  WHERE (item->>'required')::boolean = true;
  
  -- Count completed required items
  v_completed_items := NEW.completed_items;
  SELECT COUNT(*) INTO v_completed_count
  FROM jsonb_array_elements(v_template_items) template_item
  JOIN jsonb_array_elements(v_completed_items) completed_item
    ON template_item->>'id' = completed_item->>'id'
  WHERE (template_item->>'required')::boolean = true
    AND (completed_item->>'checked')::boolean = true;
  
  -- Auto-complete if all required items are checked
  IF v_completed_count >= v_total_required AND v_total_required > 0 THEN
    NEW.status := 'completed';
    NEW.completed_at := now();
    -- Set completed_by to current authenticated user UUID, or preserve existing
    NEW.completed_by := COALESCE(auth.uid(), NEW.completed_by);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
