import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploaderProps {
  projectId: string;
  documentId?: string;
  onSuccess: () => void;
}

export const DocumentUploader = ({ projectId, documentId, onSuccess }: DocumentUploaderProps) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState('');

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
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
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

        // Insert document version
        const { error: versionError } = await supabase
          .from('document_versions')
          .insert({
            document_id: documentId,
            version_number: newVersion,
            file_path: fileName,
            file_size: file.size,
            notes: notes || null,
          });

        if (versionError) throw versionError;

        // Update document current version
        const { error: updateError } = await supabase
          .from('documents')
          .update({ current_version: newVersion })
          .eq('id', documentId);

        if (updateError) throw updateError;
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
      <div className="space-y-2">
        <Label>Select File</Label>
        <div className="flex items-center gap-2">
          <Input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.dwg,.dxf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
            disabled={uploading}
          />
        </div>
        {file && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
          </div>
        )}
      </div>

      {documentId && (
        <div className="space-y-2">
          <Label>Version Notes</Label>
          <Textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Describe changes in this version..."
            disabled={uploading}
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
