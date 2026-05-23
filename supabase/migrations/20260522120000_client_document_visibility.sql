-- Add per-document client visibility and align policies with project portal settings

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS is_client_portal_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_documents_to_client boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_milestones_to_client boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_photos_to_client boolean NOT NULL DEFAULT true;

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS is_client_visible boolean NOT NULL DEFAULT true;

DROP POLICY IF EXISTS "Documents viewable by team" ON public.documents;
CREATE POLICY "Documents viewable by team" ON public.documents
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'project_manager')
  OR (
    public.has_role(auth.uid(), 'engineer')
    AND state IN ('afc', 'as_built')
    AND EXISTS (
      SELECT 1
      FROM public.project_assignments pa
      WHERE pa.project_id = documents.project_id
      AND pa.user_id = auth.uid()
    )
  )
  OR (
    public.has_role(auth.uid(), 'customer')
    AND state IN ('afc', 'as_built')
    AND COALESCE(documents.is_client_visible, true)
    AND EXISTS (
      SELECT 1
      FROM public.projects p
      JOIN public.clients c ON p.client_id = c.id
      WHERE p.id = documents.project_id
      AND c.user_id = auth.uid()
      AND p.is_client_portal_active IS TRUE
      AND p.show_documents_to_client IS TRUE
    )
  )
);

DROP POLICY IF EXISTS "Customers view approved doc versions" ON public.document_versions;
CREATE POLICY "Customers view approved doc versions" ON public.document_versions
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.documents d
    JOIN public.projects p ON p.id = d.project_id
    JOIN public.clients c ON c.id = p.client_id
    WHERE d.id = document_versions.document_id
    AND d.state IN ('afc', 'as_built')
    AND COALESCE(d.is_client_visible, true)
    AND c.user_id = auth.uid()
    AND p.is_client_portal_active IS TRUE
    AND p.show_documents_to_client IS TRUE
  )
);

DROP POLICY IF EXISTS "View stage files" ON public.project_stage_files;
CREATE POLICY "View stage files" ON public.project_stage_files FOR
SELECT TO authenticated USING (
  EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.id = project_stage_files.project_id
    AND (
      public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'project_manager')
      OR public.has_role(auth.uid(), 'qa_manager')
      OR EXISTS (
        SELECT 1
        FROM public.project_assignments pa
        WHERE pa.project_id = p.id
        AND pa.user_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1
        FROM public.clients c
        WHERE c.id = p.client_id
        AND c.user_id = auth.uid()
        AND p.is_client_portal_active IS TRUE
        AND p.show_documents_to_client IS TRUE
      )
    )
  )
);
