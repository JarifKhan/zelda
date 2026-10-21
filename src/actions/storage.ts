'use server';

import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Server action to upload an image file directly to the Supabase 'product-images' bucket
 * using service_role privileges to ensure reliable, RLS-bypass uploads.
 */
export async function uploadProductImageAction(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  try {
    const file = formData.get('file') as File | null;
    if (!file) {
      return { error: 'No file was provided for upload.' };
    }

    const admin = createAdminClient();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
    const uniqueId = crypto.randomUUID().slice(0, 8);
    const filePath = `products/${Date.now()}-${uniqueId}-${sanitizedName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await admin.storage
      .from('product-images')
      .upload(filePath, buffer, {
        contentType: file.type || 'image/jpeg',
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      return { error: error.message };
    }

    const { data: publicData } = admin.storage
      .from('product-images')
      .getPublicUrl(data.path);

    return { url: publicData.publicUrl };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Image upload failed';
    return { error: msg };
  }
}
