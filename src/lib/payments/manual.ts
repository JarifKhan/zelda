import { Order } from '@/types';
import { PaymentInitResult, PaymentProvider } from './types';

export class ManualPaymentProvider implements PaymentProvider {
  id = 'manual_bank' as const;
  displayName = 'Direct Bank Transfer / Wire';
  description = 'Transfer funds directly to our verified merchant account and submit the reference number.';

  isAvailable(): boolean {
    return true;
  }

  async processPayment(order: Order): Promise<PaymentInitResult> {
    return {
      success: true,
      orderNumber: order.order_number,
      paymentMethod: 'manual_bank',
      paymentStatus: 'verifying',
      instructions: 'Please transfer the total amount to Account #9876-5432-10 with reference ' + order.order_number + '. Once verified by our billing team, your order will be dispatched.',
      metadata: {
        bankName: 'First Commercial Commerce Bank',
        routingNumber: '021000021',
        accountNumber: '9876-5432-10',
      },
    };
  }
}
