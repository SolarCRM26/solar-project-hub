import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploaderProps {
  projectId: string;
  documentId?: string;
  documentName?: string;
  documentState?: string;
  onSuccess: () => void;
}

export const DocumentUploader = ({ projectId, documentId, documentName, documentState, onSuccess }: DocumentUploaderProps) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState('');
  const [documentType, setDocumentType] = useState('drawing');
  const [category, setCategory] = useState('design');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!file) {
      toast({ title: 'No file selected', variant: 'destructive' });
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      // Get file extension and MIME type
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      const mimeType = file.type || 'application/octet-stream';
      const fileName = `${projectId}/${Date.now()}.${fileExt}`;
      
      setProgress(30);
      
      const { error: uploadError } = await supabase.storage
        .from('project-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      setProgress(60);

      // If documentId is provided, create a new version
      if (documentId) {
        // Get current version
        const { data: doc, error: docError } = await supabase
          .from('documents')
          .select('current_version')
          .eq('id', documentId)
          .single();

        if (docError) throw docError;

        const newVersion = (doc.current_version || 0) + 1;

        // Insert document version with enhanced metadata
        const { error: versionError } = await supabase
          .from('document_versions')
          .insert({
            document_id: documentId,
            version_number: newVersion,
            file_path: fileName,
            file_size: file.size,
            mime_type: mimeType,
            notes: notes || null,
          });

        if (versionError) throw versionError;

        // Update document with enhanced metadata
        const { error: updateError } = await supabase
          .from('documents')
          .update({ 
            current_version: newVersion,
            file_format: fileExt,
            updated_at: new Date().toISOString()
          })
          .eq('id', documentId);

        if (updateError) throw updateError;
      } else {
        // Create new document if no documentId provided
        const { error: createError } = await supabase
          .from('document_versions')
          .insert({
            document_id: documentId,
            version_number: 1,
            file_path: fileName,
            file_size: file.size,
            mime_type: mimeType,
            notes: notes || null,
          });

        if (createError) throw createError;
      }

      setProgress(100);
      toast({ title: 'File uploaded successfully' });
      setFile(null);
      setNotes('');
      onSuccess();
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      {documentId && documentName && (
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium">Uploading new version for:</p>
          <p className="text-sm text-muted-foreground">{documentName}</p>
          {documentState && (
            <p className="text-xs text-muted-foreground mt-1">
              Current state: <span className="font-medium">{documentState}</span>
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label>Select File</Label>
        <div className="flex items-center gap-2">
          <Input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.dwg,.dxf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.rvt,.ifc"
            disabled={uploading}
          />
        </div>
        {file && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 bg-muted/50 rounded">
            <FileText className="h-4 w-4" />
            <div className="flex-1">
              <p className="font-medium">{file.name}</p>
              <p className="text-xs">
                {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || 'Unknown type'}
              </p>
            </div>
          </div>
        )}
      </div>

      {!documentId && (
        <>
          <div className="space-y-2">
            <Label>Document Type</Label>
            <Select value={documentType} onValueChange={setDocumentType} disabled={uploading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="drawing">Drawing</SelectItem>
                <SelectItem value="specification">Specification</SelectItem>
                <SelectItem value="report">Report</SelectItem>
                <SelectItem value="permit">Permit</SelectItem>
                <SelectItem value="photo">Photo</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory} disabled={uploading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="structural">Structural</SelectItem>
                <SelectItem value="permitting">Permitting</SelectItem>
                <SelectItem value="construction">Construction</SelectItem>
                <SelectItem value="commissioning">Commissioning</SelectItem>
                <SelectItem value="closeout">Closeout</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {documentId && (
        <div className="space-y-2">
          <Label>Version Notes</Label>
          <Textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Describe changes in this version..."
            disabled={uploading}
            rows={3}
          />
        </div>
      )}

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      <Button
        onClick={uploadFile}
        disabled={!file || uploading}
        className="w-full"
      >
        {uploading ? (
          <>Uploading...</>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" /> Upload File
          </>
        )}
      </Button>
    </div>
  );
};
