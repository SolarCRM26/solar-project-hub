import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DocStateBadge } from '@/components/StatusBadges';
import { DocumentVersionHistory } from '@/components/DocumentVersionHistory';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { FileCheck2, Search, Download, Eye, FileText, PackageCheck, FlaskConical } from 'lucide-react';

interface CustomerDocument {
  id: string;
  name: string;
  description: string | null;
  state: 'draft' | 'in_review' | 'afc' | 'as_built';
  current_version: number;
  project_id: string;
  created_at: string;
  updated_at: string;
  document_type: string | null;
  category: string | null;
  is_client_visible?: boolean | null;
  projects: {
    id: string;
    name: string;
    stage: string;
    is_client_portal_active?: boolean | null;
    show_documents_to_client?: boolean | null;
  } | null;
}

type StageFileDocument = {
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  is_client_visible?: boolean | null;
};

type StageFileRow = {
  id: string;
  project_id: string;
  stage_key: string;
  stage_name: string;
  documents: StageFileDocument[];
  projects: {
    id: string;
    name: string;
    stage: string;
    is_client_portal_active?: boolean | null;
    show_documents_to_client?: boolean | null;
  } | null;
};

const qaReadyStages = new Set(['qa_passed', 'commissioned', 'closeout_delivered']);

const CustomerDocuments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<CustomerDocument | null>(null);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['customer-document-access', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          projects(id, name, stage, is_client_portal_active, show_documents_to_client)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return data as unknown as CustomerDocument[];
    },
    enabled: !!user,
  });

  const { data: stageFiles = [], isLoading: stageFilesLoading } = useQuery({
    queryKey: ['customer-stage-files', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_stage_files')
        .select('*, projects(id, name, stage, is_client_portal_active, show_documents_to_client)')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return data as unknown as StageFileRow[];
    },
    enabled: !!user,
  });

  const { data: checklistRuns = [], isLoading: checklistRunsLoading } = useQuery({
    queryKey: ['customer-checklist-runs', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklist_runs')
        .select('*, projects(id, name, stage, is_client_portal_active, show_documents_to_client)')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return data || [];
    },
    enabled: !!user,
  });

  const normalizedSearch = search.trim().toLowerCase();

  const isVisibleToClient = (doc: CustomerDocument) => {
    const portalActive = doc.projects?.is_client_portal_active ?? true;
    const docsEnabled = doc.projects?.show_documents_to_client ?? true;
    const docVisible = doc.is_client_visible ?? true;
    return portalActive && docsEnabled && docVisible;
  };

  const visibleDocuments = documents.filter(isVisibleToClient);

  const stageFileDocuments = stageFiles.flatMap((row) =>
    (row.documents || []).map((doc) => ({
      ...doc,
      project: row.projects,
      stage_name: row.stage_name,
    })),
  );

  const visibleStageFiles = stageFileDocuments.filter((doc) => {
    const portalActive = doc.project?.is_client_portal_active ?? true;
    const docsEnabled = doc.project?.show_documents_to_client ?? true;
    const docVisible = doc.is_client_visible ?? true;
    return portalActive && docsEnabled && docVisible;
  });

  const itemTitleMap: Record<string, string> = {
    'receive-deliver-materials': 'Receive/Deliver Materials to Job Site',
    'materials-quality-inspection': 'Materials Quality Inspection & Sign-Off',
    'install-racking-system': 'Install Racking System',
    'install-pvc-pipe': 'Install PVC Pipe',
    'install-inverter': 'Install Inverter',
    'install-dc-home-run': 'Install Home Run for DC',
    'install-ac-disconnect': 'Install AC Disconnect and Wiring',
    'install-pv-modules': 'Install PV Modules',
    'submit-shop-drawings': 'Submit Shop Drawings to ESA',
    'pm-review-signoff': 'Project Manager Review & Sign-Off',
  };

  const getItemName = (id: string) => {
    if (itemTitleMap[id]) return itemTitleMap[id];
    return id
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const checklistFileDocuments = checklistRuns.flatMap((run: any) => {
    const project = run.projects;
    const portalActive = project?.is_client_portal_active ?? true;
    const docsEnabled = project?.show_documents_to_client ?? true;
    if (!portalActive || !docsEnabled) return [];

    const completedItems = run.completed_items;
    if (!completedItems) return [];

    const filesList: any[] = [];

    if (Array.isArray(completedItems)) {
      completedItems.forEach((item: any) => {
        if (item && Array.isArray(item.files)) {
          item.files.forEach((file: any) => {
            filesList.push({
              file_path: file.file_path,
              file_name: file.file_name,
              file_size: file.file_size,
              mime_type: file.mime_type,
              uploaded_at: file.uploaded_at || run.updated_at || run.created_at,
              project,
              item_name: item.text || 'Checklist Item',
            });
          });
        }
      });
    } else if (typeof completedItems === 'object') {
      Object.keys(completedItems).forEach((key) => {
        const itemState = completedItems[key];
        if (itemState && Array.isArray(itemState.files)) {
          itemState.files.forEach((file: any) => {
            filesList.push({
              file_path: file.file_path,
              file_name: file.file_name,
              file_size: file.file_size,
              mime_type: file.mime_type,
              uploaded_at: file.uploaded_at || run.updated_at || run.created_at,
              project,
              item_name: getItemName(key),
            });
          });
        }
      });
    }

    return filesList;
  });

  const visibleChecklistFiles = checklistFileDocuments;

  const matchesSearch = (doc: CustomerDocument) => {
    if (!normalizedSearch) return true;

    return (
      doc.name.toLowerCase().includes(normalizedSearch) ||
      doc.projects?.name?.toLowerCase().includes(normalizedSearch) ||
      doc.document_type?.toLowerCase().includes(normalizedSearch) ||
      doc.category?.toLowerCase().includes(normalizedSearch)
    );
  };

  const matchesStageFileSearch = (doc: {
    file_name: string;
    stage_name?: string;
    project?: { name?: string | null } | null;
  }) => {
    if (!normalizedSearch) return true;

    return (
      doc.file_name.toLowerCase().includes(normalizedSearch) ||
      doc.stage_name?.toLowerCase().includes(normalizedSearch) ||
      doc.project?.name?.toLowerCase().includes(normalizedSearch)
    );
  };

  const isPostQaProject = (doc: CustomerDocument) => {
    const stage = doc.projects?.stage;
    return !!stage && qaReadyStages.has(stage);
  };

  const approvedDocuments = visibleDocuments.filter(
    doc => doc.state === 'afc' && doc.document_type !== 'report' && matchesSearch(doc),
  );

  const asBuiltDrawings = visibleDocuments.filter(
    doc => doc.state === 'as_built' && doc.document_type === 'drawing' && matchesSearch(doc),
  );

  const testReports = visibleDocuments.filter(
    doc =>
      doc.document_type === 'report' &&
      (doc.state === 'afc' || doc.state === 'as_built') &&
      isPostQaProject(doc) &&
      matchesSearch(doc),
  );

  const filteredStageFiles = visibleStageFiles.filter(matchesStageFileSearch);
  const stageFilesCount = visibleStageFiles.length;

  const filteredChecklistFiles = visibleChecklistFiles.filter((doc) => {
    if (!normalizedSearch) return true;
    return (
      doc.file_name.toLowerCase().includes(normalizedSearch) ||
      doc.item_name.toLowerCase().includes(normalizedSearch) ||
      doc.project?.name?.toLowerCase().includes(normalizedSearch)
    );
  });

  const openVersionHistory = (doc: CustomerDocument) => {
    setSelectedDoc(doc);
    setVersionHistoryOpen(true);
  };

  const downloadStageFile = async (doc: { file_path: string; file_name: string }) => {
    try {
      const { data, error } = await supabase.storage
        .from('project-documents')
        .createSignedUrl(doc.file_path, 3600);

      if (error || !data?.signedUrl) throw error;

      window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({ title: 'Download failed', description: errorMessage, variant: 'destructive' });
    }
  };

  const downloadDocument = async (doc: CustomerDocument) => {
    try {
      const { data: versions, error: versionError } = await supabase
        .from('document_versions')
        .select('file_path, version_number')
        .eq('document_id', doc.id)
        .order('version_number', { ascending: false })
        .limit(1);

      if (versionError) throw versionError;

      if (!versions || versions.length === 0) {
        toast({ title: 'No file available', variant: 'destructive' });
        return;
      }

      const latest = versions[0];
      const { data, error } = await supabase.storage
        .from('project-documents')
        .download(latest.file_path);

      if (error) throw error;

      try {
        await supabase.rpc('log_document_download' as never, {
          doc_id: doc.id,
          version_num: latest.version_number,
        } as never);
      } catch (rpcError) {
        console.warn('Download logging not available yet');
      }

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.name}_v${latest.version_number}`;
      a.click();
      URL.revokeObjectURL(url);

      toast({ title: 'Download started' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({ title: 'Download failed', description: errorMessage, variant: 'destructive' });
    }
  };

  const renderDocumentTable = (sectionDocs: CustomerDocument[], emptyDescription: string) => {
    if (sectionDocs.length === 0) {
      return (
        <EmptyState
          icon={FileText}
          title="No documents available"
          description={emptyDescription}
        />
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sectionDocs.map(doc => (
            <TableRow key={doc.id}>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium">{doc.name}</p>
                  {doc.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{doc.description}</p>
                  )}
                </div>
              </TableCell>
              <TableCell>{doc.projects?.name || '—'}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {doc.document_type || 'unknown'}
                </Badge>
              </TableCell>
              <TableCell>
                <DocStateBadge state={doc.state} />
              </TableCell>
              <TableCell className="font-mono text-sm">v{doc.current_version}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(doc.updated_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openVersionHistory(doc)}
                    title="Version History"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadDocument(doc)}
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  if (isLoading || stageFilesLoading || checklistRunsLoading) {
    return <LoadingSpinner text="Loading document access..." />;
  }

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FileCheck2 className="h-8 w-8 text-primary" /> Document Access
        </h1>
        <p className="text-muted-foreground mt-1">
          Access approved documents, as-built drawings, and post-QA test reports for your projects
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by document, project, type..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <PackageCheck className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Approved Documents</p>
                <p className="text-2xl font-bold">{approvedDocuments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">As-Built Drawings</p>
                <p className="text-2xl font-bold">{asBuiltDrawings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FlaskConical className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Post-QA Test Reports</p>
                <p className="text-2xl font-bold">{testReports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Stage & Checklist Files</p>
                <p className="text-2xl font-bold">{stageFilesCount + visibleChecklistFiles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Approved Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {renderDocumentTable(
            approvedDocuments,
            'No approved documents are currently available.',
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Stage Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStageFiles.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No stage documents available"
              description="Stage uploads will appear here when shared with clients."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStageFiles.map((doc) => (
                  <TableRow key={doc.file_path}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{doc.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(doc.file_size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{doc.project?.name || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {doc.stage_name || 'stage'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            downloadStageFile({
                              file_path: doc.file_path,
                              file_name: doc.file_name,
                            })
                          }
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Installation Checklist Files</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredChecklistFiles.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No checklist files available"
              description="Installation checklist uploads will appear here when shared by the team."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Checklist Item</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredChecklistFiles.map((doc, idx) => (
                  <TableRow key={`${doc.file_path}-${idx}`}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{doc.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(doc.file_size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{doc.project?.name || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {doc.item_name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            downloadStageFile({
                              file_path: doc.file_path,
                              file_name: doc.file_name,
                            })
                          }
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>As-Built Drawings</CardTitle>
        </CardHeader>
        <CardContent>
          {renderDocumentTable(
            asBuiltDrawings,
            'No as-built drawings are currently available.',
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Test Reports (After QA)</CardTitle>
        </CardHeader>
        <CardContent>
          {renderDocumentTable(
            testReports,
            'No post-QA test reports are currently available.',
          )}
        </CardContent>
      </Card>

      <Dialog open={versionHistoryOpen} onOpenChange={setVersionHistoryOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedDoc?.name}</DialogTitle>
          </DialogHeader>
          {selectedDoc && (
            <DocumentVersionHistory
              documentId={selectedDoc.id}
              documentName={selectedDoc.name}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerDocuments;