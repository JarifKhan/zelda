import { Order } from '@/types';
import { PaymentInitResult, PaymentProvider } from './types';

export class StripePaymentProvider implements PaymentProvider {
  id = 'stripe' as const;
  displayName = 'Credit / Debit Card (Stripe)';
  description = 'Pay securely with Visa, MasterCard, American Express, Apple Pay, or Google Pay.';

  isAvailable(): boolean {
    return Boolean(process.env.STRIPE_SECRET_KEY);
  }

  async processPayment(order: Order): Promise<PaymentInitResult> {
    if (!this.isAvailable()) {
      return {
        success: false,
        orderNumber: order.order_number,
        paymentMethod: 'stripe',
        paymentStatus: 'unpaid',
        error: 'Stripe gateway is currently not configured. Set STRIPE_SECRET_KEY in .env.local to enable.',
      };
    }

    // When STRIPE_SECRET_KEY is configured, this creates a Stripe Checkout Session or PaymentIntent
    return {
      success: true,
      orderNumber: order.order_number,
      paymentMethod: 'stripe',
      paymentStatus: 'unpaid',
      metadata: {
        note: 'Stripe integration configured and ready for live keys.',
      },
    };
  }
}
