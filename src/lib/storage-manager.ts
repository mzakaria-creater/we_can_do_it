/**
 * 📎 Press2Pay - Storage & Attachments Manager
 * Handle file uploads to Supabase Storage with RLS
 */

import { supabase } from './supabase';
import { toast } from 'sonner';

// ✅ Types
export interface Attachment {
  id: string;
  message_id: string;
  conversation_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  created_at: string;
  url?: string; // Signed URL
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// ✅ Configuration
const BUCKET_NAME = 'message-attachments';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain',
  // Archives
  'application/zip',
];

// ✅ File Validation
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `حجم الملف يتجاوز 50MB. الحجم الحالي: ${formatFileSize(file.size)}`,
    };
  }

  // Check type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `نوع الملف غير مدعوم: ${file.type}`,
    };
  }

  return { valid: true };
}

// ✅ Format File Size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ✅ Get File Extension
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

// ✅ Upload File to Storage
export async function uploadAttachment(
  file: File,
  conversationId: string,
  userId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'ملف غير صالح');
      return { success: false, error: validation.error };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const extension = getFileExtension(file.name);
    const uniqueFilename = `${timestamp}-${random}.${extension}`;

    // Storage path: conversation_id/user_id/filename
    const storagePath = `${conversationId}/${userId}/${uniqueFilename}`;

    console.log('[Storage] Uploading file:', {
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type,
      path: storagePath,
    });

    // Upload to Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('[Storage] Upload error:', uploadError);
      toast.error('فشل رفع الملف');
      return { success: false, error: uploadError.message };
    }

    console.log('[Storage] Upload successful:', uploadData);

    // Return attachment data
    return {
      success: true,
      data: {
        file_name: file.name,
        file_path: storagePath,
        file_size: file.size,
        mime_type: file.type,
      },
    };
  } catch (error: any) {
    console.error('[Storage] Upload exception:', error);
    toast.error('خطأ في رفع الملف');
    return { success: false, error: error.message };
  }
}

// ✅ Get Signed URL for File
export async function getAttachmentUrl(
  filePath: string,
  expiresIn: number = 3600 // 1 hour
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('[Storage] Signed URL error:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('[Storage] Signed URL exception:', error);
    return null;
  }
}

// ✅ Get Public URL (for public buckets - not used here)
export function getPublicUrl(filePath: string): string | null {
  try {
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('[Storage] Public URL error:', error);
    return null;
  }
}

// ✅ Delete File from Storage
export async function deleteAttachment(
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('[Storage] Delete error:', error);
      toast.error('فشل حذف الملف');
      return { success: false, error: error.message };
    }

    toast.success('تم حذف الملف');
    return { success: true };
  } catch (error: any) {
    console.error('[Storage] Delete exception:', error);
    return { success: false, error: error.message };
  }
}

// ✅ Download File
export async function downloadAttachment(
  filePath: string,
  fileName: string
): Promise<void> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(filePath);

    if (error) {
      console.error('[Storage] Download error:', error);
      toast.error('فشل تحميل الملف');
      return;
    }

    // Create download link
    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('تم تحميل الملف');
  } catch (error) {
    console.error('[Storage] Download exception:', error);
    toast.error('خطأ في تحميل الملف');
  }
}

// ✅ List Files in Conversation
export async function listConversationFiles(
  conversationId: string
): Promise<any[]> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(conversationId, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('[Storage] List error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[Storage] List exception:', error);
    return [];
  }
}

// ✅ Get File Icon based on MIME type
export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.includes('word')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType === 'text/csv') return '📊';
  if (mimeType === 'application/zip') return '📦';
  return '📎';
}

// ✅ Check if file is image
export function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

// ✅ Create Thumbnail for Image (client-side)
export async function createThumbnail(
  file: File,
  maxWidth: number = 300,
  maxHeight: number = 300
): Promise<Blob | null> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => resolve(blob),
          'image/jpeg',
          0.8
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// ✅ Batch Upload Multiple Files
export async function uploadMultipleAttachments(
  files: File[],
  conversationId: string,
  userId: string,
  onProgress?: (fileIndex: number, progress: UploadProgress) => void
): Promise<Array<{ success: boolean; data?: any; error?: string }>> {
  const results = [];

  for (let i = 0; i < files.length; i++) {
    const result = await uploadAttachment(
      files[i],
      conversationId,
      userId,
      (progress) => onProgress?.(i, progress)
    );
    results.push(result);
  }

  return results;
}

// ✅ React Hook: useFileUpload
export function useFileUpload() {
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState<UploadProgress | null>(null);

  const upload = async (
    file: File,
    conversationId: string,
    userId: string
  ) => {
    setUploading(true);
    setProgress({ loaded: 0, total: file.size, percentage: 0 });

    const result = await uploadAttachment(
      file,
      conversationId,
      userId,
      (prog) => setProgress(prog)
    );

    setUploading(false);
    setProgress(null);

    return result;
  };

  return { upload, uploading, progress };
}

// Export for React
import React from 'react';

export default {
  uploadAttachment,
  getAttachmentUrl,
  deleteAttachment,
  downloadAttachment,
  validateFile,
  formatFileSize,
  getFileIcon,
  isImage,
};
