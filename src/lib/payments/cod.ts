import { Order } from '@/types';
import { PaymentInitResult, PaymentProvider } from './types';

export class CashOnDeliveryProvider implements PaymentProvider {
  id = 'cod' as const;
  displayName = 'Cash on Delivery (COD)';
  description = 'Pay in cash or mobile payment upon package delivery to your doorstep.';

  isAvailable(): boolean {
    return true; // Always available
  }

  async processPayment(order: Order): Promise<PaymentInitResult> {
    return {
      success: true,
      orderNumber: order.order_number,
      paymentMethod: 'cod',
      paymentStatus: 'unpaid',
      instructions: 'Please have the exact cash amount ready at the time of delivery. Our courier will contact you prior to arrival.',
      metadata: {
        cod_fee: 0,
        currency: 'USD',
      },
    };
  }
}
