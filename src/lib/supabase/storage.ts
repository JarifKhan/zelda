import { uploadProductImageAction } from '@/actions/storage';

export interface UploadResult {
  url?: string;
  error?: string;
}

/**
 * Uploads a single product image.
 * Uses the server action which uploads to Supabase Storage (when online)
 * or local persistent disk storage (public/uploads/products) when offline/local.
 */
export async function uploadProductImage(file: File): Promise<UploadResult> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const actionResult = await uploadProductImageAction(formData);
    if (actionResult.url) {
      return { url: actionResult.url };
    }

    if (actionResult.error) {
      return { error: actionResult.error };
    }

    return { error: 'Unknown upload error occurred.' };
  } catch (err: unknown) {
    // If the server action request itself completely failed (e.g. offline browser)
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      return { url: dataUrl };
    } catch {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      return { error: msg };
    }
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
