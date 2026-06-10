import { supabase } from './supabase';

/**
 * رفع ملف إلى Supabase Storage
 */
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File,
  options?: {
    upsert?: boolean;
    contentType?: string;
  }
): Promise<{ data: { path: string } | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: options?.upsert ?? false,
        contentType: options?.contentType ?? file.type
      });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('[Storage] Upload error:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * توليد رابط موقت لملف
 */
export const createSignedUrl = async (
  bucket: string,
  path: string,
  expiresIn: number = 60
): Promise<{ data: { signedUrl: string } | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('[Storage] Signed URL error:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * توليد رابط عام لملف
 */
export const getPublicUrl = (
  bucket: string,
  path: string
): { data: { publicUrl: string } } => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return { data };
};

/**
 * حذف ملف من Storage
 */
export const deleteFile = async (
  bucket: string,
  paths: string[]
): Promise<{ data: any | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove(paths);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('[Storage] Delete error:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * سرد الملفات في مجلد
 */
export const listFiles = async (
  bucket: string,
  path?: string,
  options?: {
    limit?: number;
    offset?: number;
    sortBy?: { column: string; order: 'asc' | 'desc' };
  }
): Promise<{ data: any[] | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path, options);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('[Storage] List error:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * تنزيل ملف
 */
export const downloadFile = async (
  bucket: string,
  path: string
): Promise<{ data: Blob | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('[Storage] Download error:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * رفع ملف مرفق بمحادثة
 */
export const uploadMessageAttachment = async (
  conversationId: string,
  userId: string,
  file: File
): Promise<{ path: string | null; signedUrl: string | null; error: Error | null }> => {
  const path = `${conversationId}/${userId}/${Date.now()}_${file.name}`;
  
  // رفع الملف
  const { data: uploadData, error: uploadError } = await uploadFile(
    'message-attachments',
    path,
    file
  );

  if (uploadError || !uploadData) {
    return { path: null, signedUrl: null, error: uploadError };
  }

  // توليد رابط موقت
  const { data: urlData, error: urlError } = await createSignedUrl(
    'message-attachments',
    path,
    3600 // ساعة واحدة
  );

  if (urlError || !urlData) {
    return { path: uploadData.path, signedUrl: null, error: urlError };
  }

  return { 
    path: uploadData.path, 
    signedUrl: urlData.signedUrl, 
    error: null 
  };
};

/**
 * إنشاء bucket إذا لم يكن موجوداً
 */
export const ensureBucketExists = async (
  bucketName: string,
  options?: {
    public?: boolean;
    fileSizeLimit?: number;
    allowedMimeTypes?: string[];
  }
): Promise<{ success: boolean; error: Error | null }> => {
  try {
    // التحقق من وجود الـ bucket
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === bucketName);

    if (bucketExists) {
      return { success: true, error: null };
    }

    // إنشاء bucket جديد
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: options?.public ?? false,
      fileSizeLimit: options?.fileSizeLimit,
      allowedMimeTypes: options?.allowedMimeTypes
    });

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('[Storage] Bucket creation error:', error);
    return { success: false, error: error as Error };
  }
};
