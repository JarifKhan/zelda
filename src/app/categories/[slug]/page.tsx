import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { getCategories, getProducts } from '@/lib/services/catalog';

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

async function CategoryContent({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categories = await getCategories();
  const currentCategory = categories.find((c) => c.slug === slug);

  if (!currentCategory) {
    notFound();
  }

  const products = await getProducts({ categorySlug: slug });

  return (
    <>
      {/* Breadcrumb & Navigation */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-black transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to All Departments
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-200 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-rose-600">
              Department Finds
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-neutral-950 mt-1">
              {currentCategory.name}
            </h1>
            {currentCategory.description && (
              <p className="text-sm text-neutral-600 mt-2 max-w-2xl leading-relaxed">
                {currentCategory.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs font-bold bg-white border border-neutral-200 text-neutral-800 px-3 py-1.5 rounded-lg shadow-2xs">
              {products.length} Active Deals
            </span>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-neutral-200 my-8">
          <Sparkles className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-neutral-900">No active stock in this category</h3>
          <p className="text-sm text-neutral-500 mt-1">
            Check back soon as new shipments arrive throughout the week.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 my-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}

export default function CategoryPage(props: CategoryPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <Suspense fallback={
          <div className="py-20 text-center text-sm text-neutral-500">
            Loading department deals...
          </div>
        }>
          <CategoryContent {...props} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
