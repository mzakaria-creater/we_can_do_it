import { supabase } from './supabase';

/**
 * ============================================
 * أمثلة استخدام Supabase Storage
 * مع أفضل الممارسات ومعالجة الأخطاء
 * ============================================
 */

// ================================================
// 1. إنشاء Signed URL (الطريقة المباشرة)
// ================================================
export const createSignedUrlDirect = async (path: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('message-attachments')
      .createSignedUrl(path, 60); // 60 ثانية

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    // data.signedUrl هو الرابط الموقت
    return data.signedUrl;
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
};

// ================================================
// 2. إنشاء Signed URL (مع Destructuring)
// ================================================
export const createSignedUrlDestructured = async (path: string) => {
  try {
    // Destructure مباشرة للحصول على signedUrl
    const { data: signed, error } = await supabase.storage
      .from('message-attachments')
      .createSignedUrl(path, 60);

    if (error) throw error;

    return signed?.signedUrl || null;
  } catch (err) {
    console.error('Error:', err);
    return null;
  }
};

// ================================================
// 3. إنشاء Signed URLs متعددة (Batch)
// ================================================
export const createSignedUrls = async (paths: string[]) => {
  try {
    const { data, error } = await supabase.storage
      .from('message-attachments')
      .createSignedUrls(paths, 3600); // ساعة واحدة

    if (error) throw error;

    // data هنا array من الروابط
    return data?.map(item => item.signedUrl) || [];
  } catch (err) {
    console.error('Error creating signed URLs:', err);
    return [];
  }
};

// ================================================
// 4. رفع ملف وإنشاء Signed URL
// ================================================
export const uploadAndGetSignedUrl = async (
  file: File,
  conversationId: string,
  userId: string
) => {
  try {
    // 1. تجهيز المسار
    const timestamp = Date.now();
    const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `${conversationId}/${userId}/${timestamp}_${fileName}`;

    // 2. رفع الملف
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('message-attachments')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, url: null, path: null, error: uploadError };
    }

    // 3. إنشاء Signed URL
    const { data: urlData, error: urlError } = await supabase.storage
      .from('message-attachments')
      .createSignedUrl(uploadData.path, 3600); // ساعة واحدة

    if (urlError) {
      console.error('Signed URL error:', urlError);
      return { 
        success: false, 
        url: null, 
        path: uploadData.path, 
        error: urlError 
      };
    }

    return {
      success: true,
      url: urlData.signedUrl,
      path: uploadData.path,
      error: null
    };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { 
      success: false, 
      url: null, 
      path: null, 
      error: err as Error 
    };
  }
};

// ================================================
// 5. تحديث Signed URL (Refresh)
// ================================================
export const refreshSignedUrl = async (path: string, expiresIn: number = 3600) => {
  try {
    const { data, error } = await supabase.storage
      .from('message-attachments')
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Error refreshing signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
};

// ================================================
// 6. التحقق من صلاحية Signed URL
// ================================================
export const isSignedUrlValid = async (signedUrl: string): Promise<boolean> => {
  try {
    const response = await fetch(signedUrl, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

// ================================================
// 7. إنشاء Public URL (بدلاً من Signed)
// ================================================
export const getPublicUrl = (path: string) => {
  const { data } = supabase.storage
    .from('message-attachments')
    .getPublicUrl(path);

  return data.publicUrl;
};

// ================================================
// 8. Download ملف من Signed URL
// ================================================
export const downloadFromSignedUrl = async (
  path: string,
  fileName: string
) => {
  try {
    // 1. إنشاء Signed URL
    const { data, error } = await supabase.storage
      .from('message-attachments')
      .createSignedUrl(path, 60);

    if (error || !data) {
      console.error('Error creating signed URL:', error);
      return false;
    }

    // 2. تنزيل الملف
    const response = await fetch(data.signedUrl);
    const blob = await response.blob();

    // 3. إنشاء رابط تنزيل
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    // 4. تنظيف
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return true;
  } catch (err) {
    console.error('Download error:', err);
    return false;
  }
};

// ================================================
// 9. حذف ملف
// ================================================
export const deleteFile = async (path: string) => {
  try {
    const { error } = await supabase.storage
      .from('message-attachments')
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error:', err);
    return false;
  }
};

// ================================================
// 10. نقل/إعادة تسمية ملف
// ================================================
export const moveFile = async (fromPath: string, toPath: string) => {
  try {
    const { error } = await supabase.storage
      .from('message-attachments')
      .move(fromPath, toPath);

    if (error) {
      console.error('Move error:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error:', err);
    return false;
  }
};

// ================================================
// 11. نسخ ملف
// ================================================
export const copyFile = async (fromPath: string, toPath: string) => {
  try {
    const { error } = await supabase.storage
      .from('message-attachments')
      .copy(fromPath, toPath);

    if (error) {
      console.error('Copy error:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error:', err);
    return false;
  }
};

// ================================================
// 12. سرد الملفات مع Signed URLs
// ================================================
export const listFilesWithSignedUrls = async (folder: string = '') => {
  try {
    // 1. سرد الملفات
    const { data: files, error: listError } = await supabase.storage
      .from('message-attachments')
      .list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (listError || !files) {
      console.error('List error:', listError);
      return [];
    }

    // 2. إنشاء Signed URLs لكل ملف
    const paths = files.map(file => `${folder}${folder ? '/' : ''}${file.name}`);
    const { data: urls, error: urlsError } = await supabase.storage
      .from('message-attachments')
      .createSignedUrls(paths, 3600);

    if (urlsError || !urls) {
      console.error('URLs error:', urlsError);
      return files.map(file => ({ ...file, signedUrl: null }));
    }

    // 3. دمج البيانات
    return files.map((file, index) => ({
      ...file,
      signedUrl: urls[index]?.signedUrl || null
    }));
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
};

// ================================================
// 13. معلومات عن ملف
// ================================================
export const getFileInfo = async (path: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('message-attachments')
      .list(path.substring(0, path.lastIndexOf('/')), {
        search: path.substring(path.lastIndexOf('/') + 1)
      });

    if (error || !data || data.length === 0) {
      return null;
    }

    return data[0];
  } catch (err) {
    console.error('Error getting file info:', err);
    return null;
  }
};

// ================================================
// 14. رفع ملفات متعددة
// ================================================
export const uploadMultipleFiles = async (
  files: File[],
  conversationId: string,
  userId: string
) => {
  try {
    const results = await Promise.all(
      files.map(file => uploadAndGetSignedUrl(file, conversationId, userId))
    );

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    return {
      successful,
      failed,
      totalSuccess: successful.length,
      totalFailed: failed.length
    };
  } catch (err) {
    console.error('Multiple upload error:', err);
    return {
      successful: [],
      failed: files.map(() => ({ 
        success: false, 
        url: null, 
        path: null, 
        error: err as Error 
      })),
      totalSuccess: 0,
      totalFailed: files.length
    };
  }
};

// ================================================
// 15. تحديد حجم الملف
// ================================================
export const getFileSize = async (path: string): Promise<number | null> => {
  try {
    const fileInfo = await getFileInfo(path);
    return fileInfo?.metadata?.size || null;
  } catch {
    return null;
  }
};

// ================================================
// مثال استخدام كامل
// ================================================
export const fullExample = async () => {
  // 1. رفع ملف
  const file = new File(['test'], 'test.txt', { type: 'text/plain' });
  const upload = await uploadAndGetSignedUrl(file, 'conv-123', 'user-456');
  
  if (!upload.success) {
    console.error('Upload failed:', upload.error);
    return;
  }

  console.log('File uploaded:', upload.path);
  console.log('Signed URL:', upload.url);

  // 2. تحديث Signed URL بعد انتهاء صلاحيته
  const newUrl = await refreshSignedUrl(upload.path!, 7200); // ساعتين
  console.log('New signed URL:', newUrl);

  // 3. سرد الملفات
  const files = await listFilesWithSignedUrls('conv-123/user-456');
  console.log('Files:', files);

  // 4. حذف الملف
  const deleted = await deleteFile(upload.path!);
  console.log('File deleted:', deleted);
};
