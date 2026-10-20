import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductDetailView } from '@/components/ProductDetailView';
import { getProductBySlug, getProducts } from '@/lib/services/catalog';

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function ProductContent({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      {/* Breadcrumbs */}
      <div className="mb-6 flex items-center gap-2 text-xs text-neutral-500">
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        <span>/</span>
        {product.category && (
          <>
            <Link href={`/categories/${product.category.slug}`} className="hover:text-black">
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-neutral-900 font-medium truncate max-w-xs">{product.title}</span>
      </div>

      {/* Product Detail View */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-10 shadow-xs mb-12">
        <ProductDetailView product={product} />
      </div>
    </>
  );
}

export default function ProductPage(props: ProductPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Suspense fallback={
          <div className="bg-white rounded-3xl border border-neutral-200 p-16 text-center text-sm text-neutral-500">
            Loading product details...
          </div>
        }>
          <ProductContent {...props} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
