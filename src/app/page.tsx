import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight, Tag, Flame, ShieldAlert } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { getCategories, getProducts } from '@/lib/services/catalog';

export const instant = false;

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ limit: 8 }),
  ]);

  const featuredProducts = products.filter((p) => p.is_featured);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/50">
      <Header />

      <main className="flex-1">
        {/* HERO SECTION: TJ Maxx / Burlington Style */}
        <section className="relative bg-neutral-900 text-white overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-40">
            <Image
              src="https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1920&q=80"
              alt="Luxe Home & Beauty Merchandising"
              fill
              priority
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
            <div className="max-w-2xl space-y-6">
              <div className="inline-flex items-center gap-2 bg-rose-600/90 text-white text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                <Flame className="w-4 h-4 text-amber-300" />
                <span>New Designer Markdowns Added Daily</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight leading-tight">
                Prestige Beauty & Luxe Home. <br />
                <span className="text-amber-400">At Off-Price Values.</span>
              </h1>

              <p className="text-base sm:text-lg text-neutral-300 font-normal leading-relaxed">
                Experience the genuine treasure hunt. Top-tier botanical skincare, fine fragrances, artisan ceramics, and cozy textiles up to <strong className="text-white">70% below department store MSRP</strong>.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  href="/categories/beauty"
                  className="bg-white text-neutral-950 hover:bg-neutral-100 font-bold px-7 py-3.5 rounded-xl shadow-lg transition-colors flex items-center gap-2 text-sm"
                >
                  <span>Shop Beauty Finds</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/categories/home-decor"
                  className="bg-neutral-800/80 hover:bg-neutral-800 text-white font-semibold border border-neutral-700 px-7 py-3.5 rounded-xl backdrop-blur-sm transition-colors text-sm"
                >
                  Shop Home Accents
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORY EXPLORER */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-rose-600 mb-1">
                Curated Departments
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 font-serif">
                Shop By Category
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group relative h-48 sm:h-64 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 block"
              >
                <Image
                  src={cat.image_url || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80'}
                  alt={cat.name}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-bold text-base sm:text-lg leading-tight group-hover:text-amber-300 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-xs text-neutral-300 flex items-center gap-1 mt-1 font-medium">
                    Explore Deals <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* FEATURED DEALS / TREASURE FINDS */}
        <section id="deals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-neutral-950 font-serif">
                  Treasure Finds: Top Markdowns
                </h2>
                <p className="text-xs text-neutral-500">
                  Limited quantities available. Once they are gone, they are gone.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block text-xs font-semibold bg-neutral-100 text-neutral-700 px-3 py-1.5 rounded-full">
              {products.length} Items Sourced
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* OFF-PRICE TRANSPARENCY PROMISE */}
        <section className="bg-amber-50/70 border-y border-amber-200/60 py-16 my-12">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
            <div className="inline-flex p-3 bg-amber-100 text-amber-900 rounded-full mb-2">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 font-serif">
              How do we price up to 70% below MSRP?
            </h3>
            <p className="text-sm sm:text-base text-neutral-700 leading-relaxed max-w-2xl mx-auto">
              We partner directly with leading luxury cosmetic houses and high-end home decor manufacturers to acquire overstock, seasonal surplus, and factory-direct releases. We pass 100% of the savings directly to you without luxury markup.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
