'use server';

import { createClient } from '@/lib/supabase/server';
import { isSupabaseAvailable } from '@/lib/supabase/health';
import { getPaymentProvider } from '@/lib/payments';
import { saveOrder } from '@/lib/services/orders';
import { isValidUSState } from '@/lib/constants/us-states';
import { getStoreSettings } from '@/lib/services/settings';
import { revalidatePath } from 'next/cache';
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
    if (!input.items || input.items.length === 0) {
      return { success: false, error: 'Your cart is empty. Please add items to check out.' };
    }

    // Comprehensive field validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!input.email || !emailRegex.test(input.email.trim())) {
      return { success: false, error: 'Please provide a valid email address.' };
    }

    const cleanPhone = (input.phone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10 || cleanPhone.length > 15) {
      return { success: false, error: 'Please provide a valid phone number (at least 10 digits).' };
    }

    const addr = input.shippingAddress;
    if (!addr) {
      return { success: false, error: 'Shipping address is required.' };
    }

    if (!addr.fullName || addr.fullName.trim().length < 2) {
      return { success: false, error: 'Please provide the recipient full name.' };
    }

    if (!addr.streetAddress || addr.streetAddress.trim().length < 5) {
      return { success: false, error: 'Please provide a complete street address.' };
    }

    if (!addr.city || addr.city.trim().length < 2) {
      return { success: false, error: 'Please provide a valid delivery city.' };
    }

    if (!addr.state || !isValidUSState(addr.state)) {
      return { success: false, error: 'Please select a valid US state from the list.' };
    }

    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!addr.postalCode || !zipRegex.test(addr.postalCode.trim())) {
      return { success: false, error: 'Please provide a valid 5-digit US ZIP code (e.g. 90210 or 90210-1234).' };
    }

    const orderNumber = generateOrderNumber();
    const billingAddress = input.billingAddress || input.shippingAddress;

    // Calculate subtotal and shipping dynamically from store settings
    const subtotal = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const settings = await getStoreSettings();
    const isFree = settings.isFreeShippingEnabled && subtotal >= settings.freeShippingThreshold;
    const shippingFee = isFree ? 0 : settings.standardShippingFee;
    const total = subtotal + shippingFee;

    const isLiveSupabase = await isSupabaseAvailable();

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

    // Persist order to active store (Supabase or local store)
    await saveOrder({
      id: orderId,
      order_number: orderNumber,
      customer_name: input.shippingAddress.fullName || input.email.split('@')[0],
      email: input.email,
      phone: input.phone,
      total,
      payment_method: input.paymentMethod,
      status: 'pending_verification',
      created_at: new Date().toISOString(),
      items_count: input.items.reduce((sum, item) => sum + item.quantity, 0),
      shipping_address: input.shippingAddress,
    });

    try {
      revalidatePath('/admin');
    } catch {
      // Ignore when running outside standard request scope
    }

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
