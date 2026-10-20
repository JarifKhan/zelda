import { PaymentMethod } from '@/types';
import { CashOnDeliveryProvider } from './cod';
import { ManualPaymentProvider } from './manual';
import { StripePaymentProvider } from './stripe';
import { PaymentProvider } from './types';

const providers: Record<PaymentMethod, PaymentProvider> = {
  cod: new CashOnDeliveryProvider(),
  manual_bank: new ManualPaymentProvider(),
  stripe: new StripePaymentProvider(),
};

export function getPaymentProvider(method: PaymentMethod): PaymentProvider {
  const provider = providers[method];
  if (!provider) {
    throw new Error(`Unsupported payment method: ${method}`);
  }
  return provider;
}

export function getAvailablePaymentProviders(): PaymentProvider[] {
  return Object.values(providers).filter((p) => p.isAvailable());
}

export * from './types';
