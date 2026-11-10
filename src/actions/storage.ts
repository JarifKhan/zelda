'use server';

import fs from 'fs/promises';
import path from 'path';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseAvailable } from '@/lib/supabase/health';

/**
 * Server action to upload an image file:
 * 1. Checks if Supabase Storage is reachable and uploads to 'product-images' bucket.
 * 2. If Supabase is offline/unreachable, gracefully saves to local disk (public/uploads/products).
 * Both paths return a valid, immediately displayable image URL.
 */
export async function uploadProductImageAction(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  try {
    const file = formData.get('file') as File | null;
    if (!file) {
      return { error: 'No file was provided for upload.' };
    }

    // Size limit: 15MB
    if (file.size > 15 * 1024 * 1024) {
      return { error: 'Image exceeds the maximum allowed size of 15MB.' };
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
    const uniqueId = crypto.randomUUID().slice(0, 8);
    const fileName = `${Date.now()}-${uniqueId}-${sanitizedName}`;

    // 1. Try Supabase Storage if service is online
    const isOnline = await isSupabaseAvailable();
    if (isOnline) {
      try {
        const admin = createAdminClient();
        const filePath = `products/${fileName}`;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data, error } = await admin.storage
          .from('product-images')
          .upload(filePath, buffer, {
            contentType: file.type || 'image/jpeg',
            cacheControl: '3600',
            upsert: false,
          });

        if (!error && data?.path) {
          const { data: publicData } = admin.storage
            .from('product-images')
            .getPublicUrl(data.path);
          return { url: publicData.publicUrl };
        }
      } catch (err) {
        console.warn('Supabase storage upload failed, saving to local file system:', err);
      }
    }

    // 2. Local File System Fallback (public/uploads/products)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
    await fs.mkdir(uploadDir, { recursive: true });

    const localFilePath = path.join(uploadDir, fileName);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(localFilePath, buffer);

    return { url: `/uploads/products/${fileName}` };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Image upload failed';
    return { error: msg };
  }
}
