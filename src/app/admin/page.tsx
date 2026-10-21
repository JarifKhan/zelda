import { Suspense } from 'react';
import { getProducts, getCategories } from '@/lib/services/catalog';
import { AdminDashboardView } from './AdminDashboardView';

async function AdminContent() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return <AdminDashboardView initialProducts={products} categories={categories} />;
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-neutral-500">Loading operations dashboard...</div>}>
      <AdminContent />
    </Suspense>
  );
}
