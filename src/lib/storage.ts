import { supabase } from '@/integrations/supabase/client';

/**
 * Download a document from Supabase storage
 * @param filePath - The storage path of the file
 * @param fileName - The name to save the file as
 * @returns Promise<boolean> - True if download successful
 */
export const downloadDocument = async (filePath: string, fileName: string): Promise<boolean> => {
  try {
    // Download the file from storage
    const { data, error } = await supabase.storage
      .from('project-documents')
      .download(filePath);

    if (error) throw error;
    if (!data) throw new Error('No data received');

    // Create a blob URL and trigger download
    const blob = new Blob([data], { type: data.type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Download failed:', error);
    return false;
  }
};

/**
 * Download a photo from Supabase storage
 * @param filePath - The storage path of the file
 * @param fileName - The name to save the file as
 * @returns Promise<boolean> - True if download successful
 */
export const downloadPhoto = async (filePath: string, fileName: string): Promise<boolean> => {
  try {
    // Download the file from storage
    const { data, error } = await supabase.storage
      .from('project-photos')
      .download(filePath);

    if (error) throw error;
    if (!data) throw new Error('No data received');

    // Create a blob URL and trigger download
    const blob = new Blob([data], { type: data.type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Download failed:', error);
    return false;
  }
};

/**
 * Get a public URL for a photo (works for public buckets)
 * @param filePath - The storage path of the file
 * @returns string - The public URL
 */
export const getPhotoUrl = (filePath: string): string => {
  const { data } = supabase.storage
    .from('project-photos')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

/**
 * Get a signed URL for a private document (expires in 1 hour)
 * @param filePath - The storage path of the file
 * @returns Promise<string | null> - The signed URL or null if error
 */
export const getDocumentSignedUrl = async (filePath: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from('project-documents')
      .createSignedUrl(filePath, 3600); // 1 hour expiration

    if (error) throw error;
    return data?.signedUrl || null;
  } catch (error) {
    console.error('Failed to create signed URL:', error);
    return null;
  }
};

/**
 * Upload a file to a specific bucket
 * @param bucket - The storage bucket name
 * @param path - The path within the bucket
 * @param file - The file object to upload
 * @returns Promise<{ path: string } | null>
 */
export const uploadFile = async (bucket: string, path: string, file: File): Promise<{ path: string } | null> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Upload to ${bucket} failed:`, error);
    return null;
  }
};

/**
 * Delete a file from a specific bucket
 * @param bucket - The storage bucket name
 * @param paths - The path(s) within the bucket to delete
 * @returns Promise<boolean>
 */
export const deleteFile = async (bucket: string, paths: string | string[]): Promise<boolean> => {
  try {
    const pathsArray = Array.isArray(paths) ? paths : [paths];
    const { error } = await supabase.storage
      .from(bucket)
      .remove(pathsArray);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Delete from ${bucket} failed:`, error);
    return false;
  }
};
