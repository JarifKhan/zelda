import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseAvailable } from '@/lib/supabase/health';
import { OrderStatus, ShippingAddress } from '@/types';

export interface AdminOrder {
  id: string;
  order_number: string;
  customer_name: string;
  email: string;
  phone: string;
  total: number;
  payment_method: string;
  status: OrderStatus;
  created_at: string;
  items_count: number;
  shipping_address?: ShippingAddress;
}

const ORDERS_FILE = path.join(process.cwd(), 'src', 'lib', 'data', 'orders.json');

async function readLocalOrders(): Promise<AdminOrder[]> {
  try {
    const raw = await fs.readFile(ORDERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeLocalOrders(orders: AdminOrder[]): Promise<void> {
  try {
    await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write local orders file:', err);
  }
}

export async function getOrders(): Promise<AdminOrder[]> {
  const available = await isSupabaseAvailable();
  if (!available) {
    return await readLocalOrders();
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return await readLocalOrders();
    }

    return data.map((o) => {
      let shipping: Partial<ShippingAddress> = {};
      try {
        shipping = typeof o.shipping_address === 'string'
          ? JSON.parse(o.shipping_address)
          : o.shipping_address || {};
      } catch {
        shipping = {};
      }

      return {
        id: o.id,
        order_number: o.order_number,
        customer_name: shipping.fullName || o.email?.split('@')[0] || 'Customer',
        email: o.email,
        phone: o.phone,
        total: Number(o.total),
        payment_method: o.payment_method,
        status: o.status as OrderStatus,
        created_at: o.created_at,
        items_count: o.items ? o.items.length : 1,
        shipping_address: shipping as ShippingAddress,
      };
    });
  } catch {
    return await readLocalOrders();
  }
}

export async function saveOrder(order: AdminOrder): Promise<void> {
  const orders = await readLocalOrders();
  const existingIndex = orders.findIndex((o) => o.order_number === order.order_number);
  if (existingIndex >= 0) {
    orders[existingIndex] = order;
  } else {
    orders.unshift(order);
  }
  await writeLocalOrders(orders);
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  const available = await isSupabaseAvailable();
  if (available) {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      if (!error) {
        return true;
      }
    } catch {
      // Fall through to local fallback
    }
  }

  // Update in local file
  const orders = await readLocalOrders();
  const index = orders.findIndex((o) => o.id === orderId || o.order_number === orderId);
  if (index >= 0) {
    orders[index].status = status;
    await writeLocalOrders(orders);
    return true;
  }
  return false;
}
