import { Suspense } from 'react';
import { connection } from 'next/server';
import { getProducts, getCategories } from '@/lib/services/catalog';
import { getOrders } from '@/lib/services/orders';
import { getStoreSettings } from '@/lib/services/settings';
import { AdminDashboardView } from './AdminDashboardView';

async function AdminContent() {
  // Opt into dynamic request-time rendering in Next.js 16 (Cache Components)
  await connection();

  const [products, categories, orders, settings] = await Promise.all([
    getProducts(),
    getCategories(),
    getOrders(),
    getStoreSettings(),
  ]);

  return (
    <AdminDashboardView
      initialProducts={products}
      categories={categories}
      initialOrders={orders}
      initialSettings={settings}
    />
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center text-sm text-neutral-500">
          Loading operations dashboard...
        </div>
      }
    >
      <AdminContent />
    </Suspense>
  );
}
