import fs from 'fs/promises';
import path from 'path';
import { StoreSettings, DEFAULT_SETTINGS } from '@/types/settings';

export type { StoreSettings };
export { DEFAULT_SETTINGS };

const SETTINGS_FILE_PATH = path.join(process.cwd(), 'src', 'lib', 'data', 'store-settings.json');

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const data = await fs.readFile(SETTINGS_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    return {
      freeShippingThreshold:
        typeof parsed.freeShippingThreshold === 'number' && !isNaN(parsed.freeShippingThreshold)
          ? parsed.freeShippingThreshold
          : DEFAULT_SETTINGS.freeShippingThreshold,
      standardShippingFee:
        typeof parsed.standardShippingFee === 'number' && !isNaN(parsed.standardShippingFee)
          ? parsed.standardShippingFee
          : DEFAULT_SETTINGS.standardShippingFee,
      isFreeShippingEnabled:
        typeof parsed.isFreeShippingEnabled === 'boolean'
          ? parsed.isFreeShippingEnabled
          : DEFAULT_SETTINGS.isFreeShippingEnabled,
      updatedAt: parsed.updatedAt || DEFAULT_SETTINGS.updatedAt,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function updateStoreSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
  const current = await getStoreSettings();
  const updated: StoreSettings = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  try {
    await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write store-settings.json:', error);
  }

  return updated;
}
