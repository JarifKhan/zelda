import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight, Tag, Flame, Scissors } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { FilterBar } from '@/components/FilterBar';
import { getCategories, getProducts } from '@/lib/services/catalog';

export const instant = false;

interface HomePageProps {
  searchParams?: Promise<{
    sort?: string;
    sortBy?: string;
    size?: string;
    color?: string;
    price?: string;
    category?: string;
    search?: string;
    viewAll?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  // Sorting is disabled for Featured Boutique Arrivals on index page - always displays curated featured boutique collection
  const size = resolvedParams.size;
  const color = resolvedParams.color;
  const priceParam = resolvedParams.price;
  const category = resolvedParams.category;
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

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({
      categorySlug: category,
      size,
      color,
      minPrice,
      maxPrice,
      sortBy: 'featured',
      limit: isViewAll ? undefined : 12,
    }),
  ]);

  // Top-level departments (parent_id is null)
  const departments = categories.filter((c) => !c.parent_id);

  return (
    <div className="min-h-screen flex flex-col bg-theme-canvas text-theme-ink">
      <Header />

      <main className="flex-1">
        {/* HERO SECTION: Luxury Boutique & Salon Merchandising */}
        <section className="relative bg-theme-ink text-white overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-30">
            <Image
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1920&q=80"
              alt="Luxury Fashion, Jewelry & Beauty Merchandising"
              fill
              priority
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/85 to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
            <div className="max-w-2xl space-y-6">
              <div className="inline-flex items-center gap-2 bg-theme-primary text-white text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-xs">
                <Flame className="w-4 h-4 text-amber-200" />
                <span>New Designer Markdowns & Salon Packages</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
                Designer Apparel, Fine Jewelry <br />
                <span className="text-amber-300">& In-Studio Salon Services.</span>
              </h1>

              <p className="text-base sm:text-lg text-neutral-200 font-normal leading-relaxed">
                Experience exceptional craftsmanship: authentic three-piece suits, Banarasi silk sarees, tailored menswear, 22K gold-plated Kundan jewelry, clean cosmetics, and licensed beauty treatments up to <strong className="text-white">60% below department store MSRP</strong>.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  href="/categories/womens-clothing"
                  className="bg-white text-theme-ink hover:bg-neutral-100 font-bold px-7 py-3.5 rounded-xl shadow-md transition-colors flex items-center gap-2 text-sm"
                >
                  <span className="text-theme-ink">Shop Women's Fashion</span>
                  <ArrowRight className="w-4 h-4 text-theme-ink" />
                </Link>
                <Link
                  href="/categories/mens-clothing"
                  className="bg-neutral-800/80 hover:bg-neutral-800 text-white font-semibold border border-neutral-700 px-7 py-3.5 rounded-xl backdrop-blur-sm transition-colors text-sm"
                >
                  Shop Men's Collection
                </Link>
                <Link
                  href="/categories/salon-services"
                  className="bg-theme-primary hover:bg-theme-primary-hover text-white font-semibold px-6 py-3.5 rounded-xl transition-colors text-sm flex items-center gap-2 shadow-md"
                >
                  <Scissors className="w-4 h-4" />
                  <span>Book Salon Services</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORY EXPLORER - 6 PRIMARY DEPARTMENTS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-theme-primary mb-1">
                Curated Collections
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-theme-ink">
                Shop By Department
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => {
              const subcats = categories.filter((c) => c.parent_id === dept.id);
              return (
                <div
                  key={dept.id}
                  className="group relative bg-white border border-neutral-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  {/* Category Image Banner */}
                  <Link
                    href={`/categories/${dept.slug}`}
                    className="relative h-48 sm:h-52 w-full overflow-hidden block bg-neutral-100"
                  >
                    <Image
                      src={dept.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'}
                      alt={dept.name}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  {/* Card Body in Solid White Container with Dark Text */}
                  <div className="p-5 bg-white text-theme-ink flex flex-col flex-1">
                    <Link
                      href={`/categories/${dept.slug}`}
                      className="group/title block"
                    >
                      <h3 className="font-bold text-lg sm:text-xl leading-tight text-theme-ink group-hover/title:text-theme-primary transition-colors">
                        {dept.name}
                      </h3>
                      <span className="text-xs text-neutral-500 group-hover/title:text-theme-primary flex items-center gap-1 mt-1.5 font-medium transition-colors">
                        Explore Department <ArrowRight className="w-3.5 h-3.5 group-hover/title:translate-x-1 transition-transform" />
                      </span>
                    </Link>

                    {/* Subcategory Pills */}
                    {subcats.length > 0 && (
                      <div className="pt-4 mt-4 border-t border-neutral-100 flex flex-wrap gap-1.5">
                        {subcats.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/categories/${sub.slug}`}
                            className="text-[11px] font-medium bg-theme-secondary/20 hover:bg-theme-secondary/40 text-theme-ink px-2.5 py-1 rounded-md transition-colors"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* FEATURED BOUTIQUE ARRIVALS */}
        <section id="deals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-theme-secondary/20 text-theme-ink rounded-lg">
                <Tag className="w-5 h-5 text-theme-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-theme-ink">
                  Featured Boutique Arrivals
                </h2>
                <p className="text-xs text-neutral-500">
                  Hand-selected pieces and in-demand salon packages with compare-at savings.
                </p>
              </div>
            </div>
          </div>

          {/* Horizontal Filter Toolbar (Sorting removed for Featured Boutique Arrivals) */}
          <div className="mb-6">
            <FilterBar
              categories={categories}
              totalProducts={products.length}
              pageSize={12}
              showSort={false}
            />
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200/90 my-6 shadow-xs">
              <Sparkles className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-theme-ink">No products match your selected filters</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                Try loosening your filters or resetting the dropdowns to explore the full catalog.
              </p>
              <Link href="/" className="inline-block mt-4 text-xs font-bold text-theme-primary hover:underline">
                Clear all filters →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* SALON STUDIO EXPERIENCE BANNER */}
        <section className="bg-theme-ink text-white my-12 py-16 border-y border-neutral-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-amber-200 text-xs font-bold uppercase tracking-widest">
                <Scissors className="w-4 h-4" />
                <span>In-Studio Beauty Lounge</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Relaxing Spa Pedicures & Master Eyebrow Threading
              </h3>
              <p className="text-neutral-200 text-sm leading-relaxed">
                Step into our private beauty suite. Enjoy our signature botanical dead sea salt pedicures, heated towel foot wraps, and precise organic cotton brow threading tailored to your facial proportions.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/categories/pedicure"
                  className="bg-white text-theme-ink hover:bg-neutral-100 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <span className="text-theme-ink font-bold">Spa Pedicure Packages →</span>
                </Link>
                <Link
                  href="/categories/eyebrow-grooming"
                  className="bg-theme-primary hover:bg-theme-primary-hover text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-sm"
                >
                  Eyebrow Shaping & Tinting →
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative h-48 rounded-xl overflow-hidden border border-neutral-800 shadow-md">
                <Image
                  src="https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=600&q=80"
                  alt="Deluxe Spa Pedicure"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-48 rounded-xl overflow-hidden border border-neutral-800 shadow-md">
                <Image
                  src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80"
                  alt="Eyebrow Threading and Shaping"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* TRANSPARENCY & QUALITY PROMISE */}
        <section className="bg-white text-theme-ink border-b border-neutral-200/80 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
            <div className="inline-flex p-3 bg-theme-secondary/20 text-theme-primary rounded-full mb-2">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-theme-ink">
              Authentic Craftsmanship & Value
            </h3>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-2xl mx-auto">
              We source directly from artisan master weavers in Banaras, certified textile houses, and licensed cosmetic laboratories. We deliver boutique-quality fabrics, authentic jewelry, and premier beauty care without traditional luxury markups.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
