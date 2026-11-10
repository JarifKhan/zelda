'use server';

import { revalidatePath } from 'next/cache';
import { updateOrderStatus as updateOrderStatusService } from '@/lib/services/orders';
import { OrderStatus } from '@/types';

export async function updateOrderStatusAction(orderId: string, status: OrderStatus): Promise<{ success: boolean; error?: string }> {
  try {
    const success = await updateOrderStatusService(orderId, status);
    if (!success) {
      return { success: false, error: 'Order not found' };
    }

    revalidatePath('/admin');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update order status';
    return { success: false, error: message };
  }
}
