import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Sparkles, ChevronRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { FilterBar } from '@/components/FilterBar';
import { getCategories, getProducts } from '@/lib/services/catalog';

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{
    sort?: string;
    sortBy?: string;
    size?: string;
    color?: string;
    price?: string;
    category?: string;
    viewAll?: string;
  }>;
}

async function CategoryContent({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const resolvedParams = searchParams ? await searchParams : {};
  const sort = resolvedParams.sort || resolvedParams.sortBy || 'featured';
  const size = resolvedParams.size;
  const color = resolvedParams.color;
  const priceParam = resolvedParams.price;
  const isViewAll = resolvedParams.viewAll === 'true';

  let minPrice: number | undefined;
  let maxPrice: number | undefined;
  if (priceParam === 'under_35') {
    maxPrice = 35;
  } else if (priceParam === '35_60') {
    minPrice = 35;
    maxPrice = 60;
  } else if (priceParam === '60_100') {
    minPrice = 60;
    maxPrice = 100;
  } else if (priceParam === 'over_100') {
    minPrice = 100;
  }

  const categories = await getCategories();
  const currentCategory = categories.find((c) => c.slug === slug);

  if (!currentCategory) {
    notFound();
  }

  // Determine parent department and related subcategories
  const parentCategory = currentCategory.parent_id
    ? categories.find((c) => c.id === currentCategory.parent_id)
    : null;

  const departmentCategory = parentCategory || currentCategory;
  const subcategories = categories.filter((c) => c.parent_id === departmentCategory.id);

  const products = await getProducts({
    categorySlug: slug,
    size,
    color,
    minPrice,
    maxPrice,
    sortBy: (sort as 'featured' | 'price_asc' | 'price_desc' | 'newest') || 'featured',
    limit: isViewAll ? undefined : 12,
  });

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-1.5 text-xs text-neutral-500 flex-wrap">
        <Link href="/" className="hover:text-theme-ink transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        {parentCategory ? (
          <>
            <Link
              href={`/categories/${parentCategory.slug}`}
              className="hover:text-theme-ink transition-colors"
            >
              {parentCategory.name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            <span className="font-semibold text-theme-ink">{currentCategory.name}</span>
          </>
        ) : (
          <span className="font-semibold text-theme-ink">{currentCategory.name}</span>
        )}
      </div>

      {/* Header Banner & Title */}
      <div className="mb-8 border-b border-neutral-200 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-theme-primary">
              {parentCategory ? parentCategory.name : 'Department Collection'}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-theme-ink mt-1">
              {currentCategory.name}
            </h1>
            {currentCategory.description && (
              <p className="text-sm text-neutral-600 mt-2 max-w-2xl leading-relaxed">
                {currentCategory.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs font-bold bg-white border border-neutral-200 text-theme-ink px-3.5 py-1.5 rounded-lg shadow-2xs">
              {products.length} Active {products.length === 1 ? 'Item' : 'Items'}
            </span>
          </div>
        </div>

        {/* Subcategory Navigation Pills */}
        {subcategories.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2 pt-2">
            <Link
              href={`/categories/${departmentCategory.slug}`}
              className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all ${
                currentCategory.id === departmentCategory.id
                  ? 'bg-theme-ink text-white shadow-xs'
                  : 'bg-white border border-neutral-200 text-theme-ink hover:border-theme-secondary'
              }`}
            >
              All {departmentCategory.name}
            </Link>
            {subcategories.map((sub) => {
              const isActive = currentCategory.id === sub.id;
              return (
                <Link
                  key={sub.id}
                  href={`/categories/${sub.slug}`}
                  className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all ${
                    isActive
                      ? 'bg-theme-primary text-white font-semibold shadow-xs'
                      : 'bg-white border border-neutral-200 text-theme-ink hover:border-theme-secondary'
                  }`}
                >
                  {sub.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Horizontal Filter & Sort Toolbar */}
      <div className="mb-6">
        <FilterBar
          categories={categories}
          totalProducts={products.length}
          pageSize={12}
          activeCategorySlug={slug}
        />
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="text-center py-20 bg-white text-theme-ink rounded-2xl border border-neutral-200 my-6 shadow-xs">
          <Sparkles className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-theme-ink">No products match your selected filters</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
            Try loosening your filters or resetting the dropdowns to explore the full collection.
          </p>
          <Link
            href={`/categories/${departmentCategory.slug}`}
            className="inline-block mt-4 text-xs font-bold text-theme-primary hover:underline"
          >
            ← View all in {departmentCategory.name}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 my-6">
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
    <div className="min-h-screen flex flex-col bg-theme-canvas text-theme-ink">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Suspense
          fallback={
            <div className="py-20 text-center text-sm text-neutral-500">
              Loading department deals...
            </div>
          }
        >
          <CategoryContent {...props} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
