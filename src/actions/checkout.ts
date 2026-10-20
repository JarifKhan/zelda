'use server';

import { createClient } from '@/lib/supabase/server';
import { getPaymentProvider } from '@/lib/payments';
import { CartItem, Order, PaymentMethod, ShippingAddress } from '@/types';

interface CheckoutInput {
  email: string;
  phone: string;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  paymentMethod: PaymentMethod;
  items: CartItem[];
}

export interface CheckoutResult {
  success: boolean;
  orderNumber?: string;
  secretToken?: string;
  redirectUrl?: string;
  instructions?: string;
  error?: string;
}

function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ZL-${dateStr}-${randomStr}`;
}

export async function processCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  try {
    if (!input.email || !input.phone || !input.shippingAddress || !input.items || input.items.length === 0) {
      return { success: false, error: 'Please provide all required checkout details and cart items.' };
    }

    const orderNumber = generateOrderNumber();
    const billingAddress = input.billingAddress || input.shippingAddress;

    // Calculate subtotal and shipping
    const subtotal = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = subtotal >= 75 ? 0 : 5.99; // Free shipping over $75
    const total = subtotal + shippingFee;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isLiveSupabase = supabaseUrl && !supabaseUrl.includes('placeholder-url');

    let orderId = 'mock-' + Math.random().toString(36).substring(2, 9);
    let secretToken = 'sec-' + Math.random().toString(36).substring(2, 9);

    if (isLiveSupabase) {
      const supabase = await createClient();

      const orderData = {
        order_number: orderNumber,
        user_id: null,
        email: input.email,
        phone: input.phone,
        shipping_address: input.shippingAddress,
        billing_address: billingAddress,
        subtotal,
        shipping_fee: shippingFee,
        total,
        payment_method: input.paymentMethod,
        payment_status: 'unpaid',
        status: 'pending_verification',
      };

      const orderItems = input.items.map((item) => ({
        product_id: item.productId,
        variant_id: item.variantId || null,
        product_title: item.title,
        variant_name: item.variantName || null,
        unit_price: item.price,
        quantity: item.quantity,
        total_price: item.price * item.quantity,
      }));

      // Call the atomic stored procedure
      const { data: rpcResult, error: rpcError } = await supabase.rpc('place_order_atomic', {
        p_order_data: orderData,
        p_items: orderItems,
      });

      if (rpcError) {
        return { success: false, error: rpcError.message };
      }

      orderId = rpcResult.order_id;
      secretToken = rpcResult.secret_token;
    }

    // Process through pluggable payment provider
    const provider = getPaymentProvider(input.paymentMethod);
    const paymentResult = await provider.processPayment({
      id: orderId,
      order_number: orderNumber,
      secret_token: secretToken,
      email: input.email,
      phone: input.phone,
      shipping_address: input.shippingAddress,
      billing_address: billingAddress,
      subtotal,
      shipping_fee: shippingFee,
      discount_amount: 0,
      total,
      status: 'pending_verification',
      payment_method: input.paymentMethod,
      payment_status: 'unpaid',
      created_at: new Date().toISOString(),
    });

    return {
      success: true,
      orderNumber,
      secretToken,
      instructions: paymentResult.instructions,
      redirectUrl: `/order-confirmation/${orderNumber}?token=${secretToken}`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Checkout failed. Please try again.';
    return { success: false, error: message };
  }
}
