'use server';

import { getStoreSettings, updateStoreSettings, StoreSettings } from '@/lib/services/settings';
import { revalidatePath } from 'next/cache';

export async function getStoreSettingsAction(): Promise<StoreSettings> {
  return await getStoreSettings();
}

export async function updateStoreSettingsAction(
  updates: Partial<StoreSettings>
): Promise<{ success: boolean; settings?: StoreSettings; error?: string }> {
  try {
    if (updates.freeShippingThreshold !== undefined) {
      const val = Number(updates.freeShippingThreshold);
      if (isNaN(val) || val < 0) {
        return { success: false, error: 'Free shipping threshold must be a valid non-negative number.' };
      }
      updates.freeShippingThreshold = Math.round(val * 100) / 100;
    }

    if (updates.standardShippingFee !== undefined) {
      const val = Number(updates.standardShippingFee);
      if (isNaN(val) || val < 0) {
        return { success: false, error: 'Standard shipping fee must be a valid non-negative number.' };
      }
      updates.standardShippingFee = Math.round(val * 100) / 100;
    }

    const updated = await updateStoreSettings(updates);

    try {
      revalidatePath('/admin');
      revalidatePath('/');
      revalidatePath('/checkout');
    } catch {
      // Ignored outside standard Next.js request lifecycle
    }

    return { success: true, settings: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update store settings.';
    return { success: false, error: message };
  }
}
