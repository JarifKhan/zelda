import { Order, PaymentMethod, PaymentStatus } from '@/types';

export interface PaymentInitResult {
  success: boolean;
  orderNumber: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  redirectUrl?: string;
  instructions?: string;
  metadata?: Record<string, unknown>;
  error?: string;
}

export interface PaymentProvider {
  id: PaymentMethod;
  displayName: string;
  description: string;
  isAvailable(): boolean;
  processPayment(order: Order, payload?: unknown): Promise<PaymentInitResult>;
}
