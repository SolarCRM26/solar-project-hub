import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DocStateBadge } from '@/components/StatusBadges';
import { Plus, FileText, Search, Upload, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DocumentUploader } from '@/components/DocumentUploader';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';

const AdminDocuments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({ name: '', description: '', project_id: '', state: 'draft' as string });

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data, error } = await supabase.from('documents').select('*, projects(name)').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('projects').select('id, name').order('name');
      if (error) throw error;
      return data;
    },
  });

  const createDoc = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('documents').insert({
        name: form.name,
        description: form.description || null,
        project_id: form.project_id,
        state: form.state as any,
        uploaded_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setOpen(false);
      toast({ title: 'Document created' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const openUploadDialog = (doc: any) => {
    setSelectedDoc(doc);
    setUploadDialogOpen(true);
  };

  const downloadDocument = async (doc: any) => {
    try {
      const { data: versions } = await supabase
        .from('document_versions')
        .select('file_path')
        .eq('document_id', doc.id)
        .order('version_number', { ascending: false })
        .limit(1);

      if (versions && versions.length > 0) {
        const { data, error } = await supabase.storage
          .from('project-documents')
          .download(versions[0].file_path);
        
        if (error) throw error;
        
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.name;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error: any) {
      toast({ title: 'Download failed', description: error.message, variant: 'destructive' });
    }
  };

  const filtered = documents.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  if (isLoading) return <LoadingSpinner text="Loading documents..." />;

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" /> Documents
          </h1>
          <p className="text-muted-foreground mt-1">{documents.length} documents</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> New Document</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Document</DialogTitle>
            </DialogHeader>
            <form onSubmit={e => { e.preventDefault(); createDoc.mutate(); }} className="space-y-4">
              <div className="space-y-2">
                <Label>Document Name</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Project</Label>
                <Select value={form.project_id} onValueChange={v => setForm(f => ({ ...f, project_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Select value={form.state} onValueChange={v => setForm(f => ({ ...f, state: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="afc">AFC</SelectItem>
                    <SelectItem value="as_built">As-Built</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createDoc.isPending || !form.project_id}>
                {createDoc.isPending ? 'Creating...' : 'Create Document'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState 
                      icon={FileText}
                      title="No documents found"
                      description="Upload your first document to get started or adjust your filters"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(doc => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{doc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{(doc as any).projects?.name || '—'}</TableCell>
                    <TableCell><DocStateBadge state={doc.state} /></TableCell>
                    <TableCell className="font-mono">v{doc.current_version}</TableCell>
                    <TableCell>{new Date(doc.updated_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openUploadDialog(doc)} title="Upload new version">
                          <Upload className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => downloadDocument(doc)} title="Download">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document Version: {selectedDoc?.name}</DialogTitle>
          </DialogHeader>
          {selectedDoc && (
            <DocumentUploader
              projectId={selectedDoc.project_id}
              documentId={selectedDoc.id}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ['documents'] });
                setUploadDialogOpen(false);
                setSelectedDoc(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDocuments;
