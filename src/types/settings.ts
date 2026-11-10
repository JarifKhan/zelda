export interface StoreSettings {
  freeShippingThreshold: number;
  standardShippingFee: number;
  isFreeShippingEnabled: boolean;
  updatedAt?: string;
}

export const DEFAULT_SETTINGS: StoreSettings = {
  freeShippingThreshold: 75,
  standardShippingFee: 5.99,
  isFreeShippingEnabled: true,
  updatedAt: '2026-10-31T00:00:00.000Z',
};
