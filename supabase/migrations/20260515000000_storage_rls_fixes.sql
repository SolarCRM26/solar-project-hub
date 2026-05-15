-- Fix RLS policies for storage buckets to allow deletion and updates for admins and PMs

-- project-documents bucket
CREATE POLICY "Admins PMs delete docs" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'project-documents' AND (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'project_manager')
  )
);

CREATE POLICY "Admins PMs update docs" ON storage.objects FOR UPDATE TO authenticated USING (
  bucket_id = 'project-documents' AND (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'project_manager')
  )
);

-- project-photos bucket
CREATE POLICY "Admins PMs delete photos" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'project-photos' AND (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'project_manager')
  )
);

CREATE POLICY "Admins PMs update photos" ON storage.objects FOR UPDATE TO authenticated USING (
  bucket_id = 'project-photos' AND (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'project_manager')
  )
);
