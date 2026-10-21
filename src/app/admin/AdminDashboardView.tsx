'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Truck, 
  Clock, 
  Search,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { Product, OrderStatus, Category } from '@/types';
import { formatCurrency, calculateSavingsPercent } from '@/lib/utils';
import { ProductTable } from '@/components/admin/ProductTable';

interface MockAdminOrder {
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
}

const INITIAL_ORDERS: MockAdminOrder[] = [
  {
    id: 'ord-1',
    order_number: 'ZL-261020-K91A',
    customer_name: 'Sophia Reynolds',
    email: 'sophia.r@example.com',
    phone: '+1 (555) 234-5678',
    total: 62.97,
    payment_method: 'cod',
    status: 'pending_verification',
    created_at: '2026-10-20 05:30',
    items_count: 3,
  },
  {
    id: 'ord-2',
    order_number: 'ZL-261019-M42B',
    customer_name: 'Marcus Vance',
    email: 'marcus.v@example.com',
    phone: '+1 (555) 876-5432',
    total: 39.98,
    payment_method: 'cod',
    status: 'confirmed',
    created_at: '2026-10-19 14:15',
    items_count: 2,
  },
  {
    id: 'ord-3',
    order_number: 'ZL-261018-P88C',
    customer_name: 'Elena Rostova',
    email: 'elena.rostova@example.com',
    phone: '+1 (555) 345-9876',
    total: 104.97,
    payment_method: 'manual_bank',
    status: 'shipped',
    created_at: '2026-10-18 11:00',
    items_count: 4,
  },
];

interface AdminDashboardViewProps {
  initialProducts: Product[];
  categories: Category[];
}

export function AdminDashboardView({ initialProducts, categories }: AdminDashboardViewProps) {
  const [orders, setOrders] = useState<MockAdminOrder[]>(INITIAL_ORDERS);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending_verification').length;
  const lowStockProducts = products.filter((p) => {
    const totalVariantStock = p.variants?.reduce((sum, v) => sum + v.stock_quantity, 0) ?? 0;
    return totalVariantStock <= 15;
  });

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const handleAdjustStock = (productId: string, variantId: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId || !p.variants) return p;
        return {
          ...p,
          variants: p.variants.map((v) => {
            if (v.id !== variantId) return v;
            return {
              ...v,
              stock_quantity: Math.max(0, v.stock_quantity + delta),
            };
          }),
        };
      })
    );
  };

  const filteredOrders = orders.filter((o) => {
    if (orderFilter !== 'all' && o.status !== orderFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Title & Supabase Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-black text-neutral-950">
            Store Operations Dashboard
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time management for beauty & home inventory, cash-on-delivery orders, and stock reservations.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-1.5 rounded-full font-semibold">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>PostgreSQL Architecture Active</span>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase">Gross Volume</span>
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-neutral-950 mt-2">{formatCurrency(totalRevenue)}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
            {orders.length} orders recorded
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase">Pending COD Verification</span>
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-neutral-950 mt-2">{pendingOrders}</p>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 inline-block">
            Needs customer phone confirmation
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase">Active Catalog SKUs</span>
            <div className="p-2 bg-blue-100 text-blue-800 rounded-lg">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-neutral-950 mt-2">{products.length} Products</p>
          <span className="text-[11px] text-neutral-500 font-medium mt-1 inline-block">
            Beauty & Home Accents
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase">Stock Alerts</span>
            <div className="p-2 bg-rose-100 text-rose-800 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 mt-2">{lowStockProducts.length}</p>
          <span className="text-[11px] text-rose-600 font-semibold mt-1 inline-block">
            SKUs with limited quantity
          </span>
        </div>
      </div>

      {/* SECTION: ORDER FULFILLMENT PIPELINE */}
      <section id="orders" className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <h2 className="text-xl font-black text-neutral-950 font-serif">
              Order Fulfillment Pipeline
            </h2>
            <p className="text-xs text-neutral-500">
              Verify Cash-on-Delivery addresses, mark packed parcels, and assign tracking numbers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs pl-8 pr-3 py-2 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-neutral-900 bg-neutral-50/50"
              />
            </div>

            <select
              value={orderFilter}
              onChange={(e) => setOrderFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-neutral-900 bg-white font-semibold text-neutral-700"
            >
              <option value="all">All Statuses</option>
              <option value="pending_verification">Pending Verification</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 pl-2">Order #</th>
                <th className="pb-3">Customer & Contact</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Payment</th>
                <th className="pb-3">Total</th>
                <th className="pb-3">Status Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="py-4 pl-2 font-mono font-bold text-neutral-950">
                    {order.order_number}
                  </td>
                  <td className="py-4">
                    <p className="font-semibold text-neutral-900">{order.customer_name}</p>
                    <p className="text-[11px] text-neutral-500">{order.phone} • {order.email}</p>
                  </td>
                  <td className="py-4 text-neutral-500">{order.created_at}</td>
                  <td className="py-4">
                    <span className="uppercase text-[10px] font-bold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded">
                      {order.payment_method.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 font-bold text-neutral-950">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="py-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border focus:outline-hidden transition-colors cursor-pointer ${
                        order.status === 'pending_verification'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : order.status === 'confirmed'
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : order.status === 'shipped'
                          ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      <option value="pending_verification">⏳ Pending Verify</option>
                      <option value="confirmed">✓ Confirmed</option>
                      <option value="processing">📦 Packing</option>
                      <option value="shipped">🚚 Shipped</option>
                      <option value="delivered">🎉 Delivered</option>
                      <option value="cancelled">✕ Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION: CATALOG & STOCK MANAGER */}
      <section id="inventory" className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div>
            <h2 className="text-xl font-black text-neutral-950 font-serif">
              Catalog & Inventory Management
            </h2>
            <p className="text-xs text-neutral-500">
              Manage live cloud products, off-price markdowns, and inventory stock.
            </p>
          </div>
        </div>

        <ProductTable initialProducts={initialProducts} categories={categories} />
      </section>
    </div>
  );
}
