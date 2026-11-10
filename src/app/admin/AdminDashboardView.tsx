'use client';

import { useState } from 'react';
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
import { formatCurrency } from '@/lib/utils';
import { ProductTable } from '@/components/admin/ProductTable';
import { AdminOrder } from '@/lib/services/orders';
import { updateOrderStatusAction } from '@/actions/admin-orders';
import { StoreSettings } from '@/types/settings';
import { ShippingSettingsControl } from '@/components/admin/ShippingSettingsControl';

interface AdminDashboardViewProps {
  initialProducts: Product[];
  categories: Category[];
  initialOrders: AdminOrder[];
  initialSettings: StoreSettings;
}

export function AdminDashboardView({
  initialProducts,
  categories,
  initialOrders,
  initialSettings,
}: AdminDashboardViewProps) {
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdatingOrder, setIsUpdatingOrder] = useState<string | null>(null);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending_verification').length;
  const lowStockProducts = products.filter((p) => {
    const totalVariantStock = p.variants?.reduce((sum, v) => sum + v.stock_quantity, 0) ?? 0;
    return totalVariantStock <= 15;
  });

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdatingOrder(orderId);
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      await updateOrderStatusAction(orderId, newStatus);
    } catch (err) {
      console.error('Failed to update status on server:', err);
    } finally {
      setIsUpdatingOrder(null);
    }
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
          <h1 className="text-3xl font-sans font-black text-theme-ink">
            Store Operations Dashboard
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time management for boutique apparel, jewelry, footwear & beauty salon services.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-1.5 rounded-full font-semibold">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Dynamic Live Pipeline Active</span>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white text-theme-ink p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase">Gross Volume</span>
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-theme-ink mt-2">{formatCurrency(totalRevenue)}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
            {orders.length} orders recorded
          </span>
        </div>

        <div className="bg-white text-theme-ink p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase">Pending COD Verification</span>
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-theme-ink mt-2">{pendingOrders}</p>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 inline-block">
            Needs customer phone confirmation
          </span>
        </div>

        <div className="bg-white text-theme-ink p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase">Active Catalog SKUs</span>
            <div className="p-2 bg-blue-100 text-blue-800 rounded-lg">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-theme-ink mt-2">{products.length} Products</p>
          <span className="text-[11px] text-neutral-500 font-medium mt-1 inline-block">
            Live Boutique Catalog
          </span>
        </div>

        <div className="bg-white text-theme-ink p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase">Stock Alerts</span>
            <div className="p-2 bg-rose-100 text-theme-primary rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-theme-primary mt-2">{lowStockProducts.length}</p>
          <span className="text-[11px] text-theme-primary font-semibold mt-1 inline-block">
            SKUs with limited quantity
          </span>
        </div>
      </div>

      {/* SECTION: SHIPPING & DELIVERY CONTROLS */}
      <section id="shipping" className="bg-white text-theme-ink rounded-3xl border border-neutral-200/80 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-neutral-100 text-neutral-800 rounded-xl">
                <Truck className="w-5 h-5 text-theme-ink" />
              </div>
              <h2 className="text-xl font-black text-theme-ink font-sans">
                Shipping & Delivery Logistics
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Configure free shipping threshold promotions, standard delivery rates, and storefront marketing visibility.
            </p>
          </div>
        </div>

        <ShippingSettingsControl initialSettings={initialSettings} />
      </section>

      {/* SECTION: ORDER FULFILLMENT PIPELINE */}
      <section id="orders" className="bg-white text-theme-ink rounded-3xl border border-neutral-200/80 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <h2 className="text-xl font-black text-theme-ink font-sans">
              Order Fulfillment Pipeline
            </h2>
            <p className="text-xs text-neutral-500">
              Verify Cash-on-Delivery addresses, manage salon reservations, and update order statuses in real-time.
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
                className="text-xs pl-8 pr-3 py-2 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-neutral-900 bg-neutral-50/50 text-theme-ink"
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
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 text-xs">
              No orders found matching the selected filter.
            </div>
          ) : (
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
                    <td className="py-4 pl-2 font-mono font-bold text-theme-ink">
                      {order.order_number}
                    </td>
                    <td className="py-4">
                      <p className="font-semibold text-theme-ink">{order.customer_name}</p>
                      <p className="text-[11px] text-neutral-500">{order.phone} • {order.email}</p>
                      {order.shipping_address && (
                        <p className="text-[10px] text-neutral-400 mt-0.5">
                          {order.shipping_address.city}, {order.shipping_address.state}
                        </p>
                      )}
                    </td>
                    <td className="py-4 text-neutral-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4">
                      <span className="uppercase text-[10px] font-bold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded">
                        {order.payment_method.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 font-bold text-theme-ink">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="py-4">
                      <select
                        value={order.status}
                        disabled={isUpdatingOrder === order.id}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border focus:outline-hidden transition-colors cursor-pointer ${
                          order.status === 'pending_verification'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : order.status === 'confirmed'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : order.status === 'shipped'
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                            : order.status === 'cancelled'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
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
          )}
        </div>
      </section>

      {/* SECTION: CATALOG & STOCK MANAGER */}
      <section id="inventory" className="bg-white text-theme-ink rounded-3xl border border-neutral-200/80 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div>
            <h2 className="text-xl font-black text-theme-ink font-sans">
              Catalog & Inventory Management
            </h2>
            <p className="text-xs text-neutral-500">
              Manage live products, custom markdowns, and inventory stock across all departments.
            </p>
          </div>
        </div>

        <ProductTable initialProducts={products} categories={categories} />
      </section>
    </div>
  );
}
