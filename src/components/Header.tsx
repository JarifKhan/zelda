'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Sparkles, ShieldCheck, Menu, X, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';
import { CartDrawer } from './CartDrawer';

const DEPARTMENTS = [
  {
    name: "Women's Fashion",
    slug: 'womens-clothing',
    subcategories: [
      { name: 'Three-Piece Suits', slug: 'three-piece-suits' },
      { name: 'Sarees', slug: 'sarees' },
      { name: 'Petticoats', slug: 'petticoats' },
      { name: 'Blouses', slug: 'blouses' },
      { name: 'Maxi Dresses', slug: 'maxi-dresses' },
      { name: 'One-Piece Dresses', slug: 'one-piece-dresses' },
      { name: 'Leggings', slug: 'leggings' },
    ],
  },
  {
    name: "Men's Fashion",
    slug: 'mens-clothing',
    subcategories: [
      { name: 'Shirts', slug: 'mens-shirts' },
      { name: 'Pants & Trousers', slug: 'pants-trousers' },
      { name: 'Punjabi & Kurtas', slug: 'punjabi-kurtas' },
    ],
  },
  {
    name: 'Jewelry & Accessories',
    slug: 'jewelry-accessories',
    subcategories: [
      { name: 'Fine & Fashion Jewelry', slug: 'jewelry' },
    ],
  },
  {
    name: 'Footwear',
    slug: 'footwear',
    subcategories: [
      { name: 'Shoes & Juttis', slug: 'shoes' },
    ],
  },
  {
    name: 'Cosmetics & Beauty',
    slug: 'cosmetics-beauty',
    subcategories: [
      { name: 'Cosmetics & Skincare', slug: 'cosmetics' },
      { name: 'Makeup Products', slug: 'makeup-products' },
    ],
  },
  {
    name: 'Salon Services',
    slug: 'salon-services',
    subcategories: [
      { name: 'Pedicure & Foot Care', slug: 'pedicure' },
      { name: 'Eyebrow Grooming & Shaping', slug: 'eyebrow-grooming' },
    ],
  },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileDept, setExpandedMobileDept] = useState<string | null>(null);
  const {
    getItemCount,
    setIsOpen,
    freeShippingThreshold,
    isFreeShippingEnabled,
    setShippingSettings,
  } = useCartStore();
  const itemCount = getItemCount();

  useEffect(() => {
    let isMounted = true;
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data) {
          setShippingSettings({
            freeShippingThreshold: data.freeShippingThreshold,
            standardShippingFee: data.standardShippingFee,
            isFreeShippingEnabled: data.isFreeShippingEnabled,
          });
        }
      })
      .catch(() => {
        // Retain store defaults on network failure
      });

    return () => {
      isMounted = false;
    };
  }, [setShippingSettings]);

  const toggleMobileDept = (slug: string) => {
    setExpandedMobileDept(expandedMobileDept === slug ? null : slug);
  };

  return (
    <>
      {/* Top Value Banner */}
      <div className="bg-theme-ink text-theme-canvas text-xs font-medium py-2 px-4 text-center tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-theme-secondary shrink-0" />
        {isFreeShippingEnabled ? (
          <span className="truncate">
            DESIGNER APPAREL, FINE JEWELRY & SALON SERVICES | FREE U.S. SHIPPING OVER ${freeShippingThreshold}
          </span>
        ) : (
          <span className="truncate">
            DESIGNER APPAREL, FINE JEWELRY & SALON SERVICES | FAST & SECURE U.S. DELIVERY
          </span>
        )}
      </div>

      <header className="sticky top-0 z-40 bg-white border-b border-neutral-200/80 text-theme-ink shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-theme-ink hover:text-theme-primary transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-theme-ink font-sans">
                  ZELDA & CO.
                </span>
                <span className="text-[10px] tracking-widest text-theme-primary font-bold -mt-1 uppercase">
                  Apparel, Fine Jewelry & Salon
                </span>
              </Link>
            </div>

            {/* Desktop Navigation with Dropdowns */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-xs font-semibold tracking-wide text-theme-ink">
              {DEPARTMENTS.map((dept) => (
                <div key={dept.slug} className="relative group py-6">
                  <Link
                    href={`/categories/${dept.slug}`}
                    className="inline-flex items-center gap-1 hover:text-theme-primary transition-colors uppercase tracking-wider py-1"
                  >
                    <span>{dept.name}</span>
                    <ChevronDown className="w-3 h-3 text-neutral-400 group-hover:text-theme-primary transition-transform group-hover:rotate-180" />
                  </Link>

                  {/* Dropdown Menu */}
                  <div className="absolute top-full left-0 w-64 bg-white text-theme-ink rounded-xl shadow-xl border border-neutral-200 py-3 px-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 -mt-1 z-50">
                    <Link
                      href={`/categories/${dept.slug}`}
                      className="block px-3 py-2 text-xs font-bold text-theme-ink hover:bg-theme-canvas rounded-lg border-b border-neutral-100 mb-1"
                    >
                      Shop All {dept.name} →
                    </Link>
                    <div className="space-y-0.5">
                      {dept.subcategories.map((sub) => (
                        <Link
                          key={sub.slug}
                          href={`/categories/${sub.slug}`}
                          className="block px-3 py-1.5 text-xs text-neutral-600 hover:text-theme-primary hover:bg-theme-canvas rounded-md transition-colors"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </nav>

            {/* Right Icons: Admin, Cart */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md bg-neutral-100 hover:bg-neutral-200 text-theme-ink transition-colors"
                title="Store Manager Dashboard"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-600" />
                <span>Admin</span>
              </Link>

              {/* Cart Trigger */}
              <button
                onClick={() => setIsOpen(true)}
                className="relative p-2.5 rounded-full hover:bg-neutral-100 transition-colors text-theme-ink"
                aria-label="Open Shopping Bag"
              >
                <ShoppingBag className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 bg-theme-primary text-white text-[11px] font-bold rounded-full h-5 w-5 flex items-center justify-center animate-in zoom-in-75">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-200 bg-white text-theme-ink px-4 pt-3 pb-6 max-h-[80vh] overflow-y-auto space-y-2">
            {DEPARTMENTS.map((dept) => {
              const isExpanded = expandedMobileDept === dept.slug;
              return (
                <div key={dept.slug} className="border-b border-neutral-100 pb-2">
                  <div className="flex items-center justify-between py-2">
                    <Link
                      href={`/categories/${dept.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="font-bold text-sm text-theme-ink hover:text-theme-primary"
                    >
                      {dept.name}
                    </Link>
                    <button
                      onClick={() => toggleMobileDept(dept.slug)}
                      className="p-1 text-neutral-400 hover:text-theme-ink"
                      aria-label={`Toggle ${dept.name} subcategories`}
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="pl-4 pb-2 space-y-1.5 bg-theme-canvas rounded-lg py-2 my-1">
                      <Link
                        href={`/categories/${dept.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-xs font-semibold text-theme-primary py-1"
                      >
                        All {dept.name}
                      </Link>
                      {dept.subcategories.map((sub) => (
                        <Link
                          key={sub.slug}
                          href={`/categories/${sub.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block text-xs text-neutral-600 hover:text-theme-ink py-1"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="pt-3">
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-theme-ink py-2"
              >
                <ShieldCheck className="w-4 h-4 text-neutral-500" />
                <span>Admin Dashboard</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Cart Drawer Modal */}
      <CartDrawer />
    </>
  );
}
