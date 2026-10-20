import { Suspense } from 'react';
import { getProducts } from '@/lib/services/catalog';
import { AdminDashboardView } from './AdminDashboardView';

async function AdminContent() {
  const products = await getProducts();
  return <AdminDashboardView initialProducts={products} />;
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-neutral-500">Loading operations dashboard...</div>}>
      <AdminContent />
    </Suspense>
  );
}
