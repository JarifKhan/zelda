import { uploadProductImageAction } from '@/actions/storage';
import { createClient } from '@/lib/supabase/client';

export interface UploadResult {
  url?: string;
  error?: string;
}

/**
 * Uploads a single product image to the 'product-images' Supabase public storage bucket.
 * Uses the secure server action with admin privileges to avoid client-side RLS blocking,
 * with graceful fallback to browser upload.
 */
export async function uploadProductImage(file: File): Promise<UploadResult> {
  try {
    // 1. First try via Server Action (bypasses RLS using service_role)
    const formData = new FormData();
    formData.append('file', file);

    const actionResult = await uploadProductImageAction(formData);
    if (actionResult.url) {
      return { url: actionResult.url };
    }

    // 2. Fallback to direct client-side upload if action reported an error
    const supabase = createClient();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
    const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10);
    const filePath = `products/${Date.now()}-${uniqueId}-${sanitizedName}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        contentType: file.type || 'image/jpeg',
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      return { error: actionResult.error || error.message };
    }

    const { data: publicData } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);

    return { url: publicData.publicUrl };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Upload failed';
    return { error: msg };
  }
}

/**
 * Uploads multiple product images in parallel.
 */
export async function uploadMultipleProductImages(
  files: File[]
): Promise<{ urls: string[]; errors: string[] }> {
  const results = await Promise.all(files.map((file) => uploadProductImage(file)));

  const urls: string[] = [];
  const errors: string[] = [];

  results.forEach((res) => {
    if (res.url) urls.push(res.url);
    if (res.error) errors.push(res.error);
  });

  return { urls, errors };
}
