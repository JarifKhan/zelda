'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Sparkles, ShieldCheck, Menu, X } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';
import { CartDrawer } from './CartDrawer';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getItemCount, setIsOpen } = useCartStore();
  const itemCount = getItemCount();

  return (
    <>
      {/* Top Value Banner */}
      <div className="bg-neutral-900 text-white text-xs font-medium py-2 px-4 text-center tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>TREASURE HUNT DEALS: UP TO 70% OFF DESIGNER BEAUTY & HOME GOODS | FREE SHIPPING OVER $75</span>
      </div>

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            
            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-700 hover:text-black"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-neutral-950 font-serif">
                  ZELDA & CO.
                </span>
                <span className="text-[10px] tracking-widest text-rose-600 font-bold -mt-1 uppercase">
                  Off-Price Beauty & Home
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wide text-neutral-700">
              <Link href="/categories/beauty" className="hover:text-rose-600 transition-colors">
                Beauty & Fragrance
              </Link>
              <Link href="/categories/home-decor" className="hover:text-rose-600 transition-colors">
                Home Accents
              </Link>
              <Link href="/categories/kitchen" className="hover:text-rose-600 transition-colors">
                Kitchen & Table
              </Link>
              <Link href="/categories/bath-wellness" className="hover:text-rose-600 transition-colors">
                Bath & Wellness
              </Link>
              <Link href="/#deals" className="text-rose-600 font-bold hover:text-rose-700 flex items-center gap-1">
                <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-xs">Clearance Finds</span>
              </Link>
            </nav>

            {/* Right Icons: Admin, Search, Cart */}
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors"
                title="Store Manager Dashboard"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-600" />
                <span>Admin Portal</span>
              </Link>

              {/* Cart Trigger */}
              <button
                onClick={() => setIsOpen(true)}
                className="relative p-2.5 rounded-full hover:bg-neutral-100 transition-colors text-neutral-900"
                aria-label="Open Shopping Bag"
              >
                <ShoppingBag className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 bg-rose-600 text-white text-[11px] font-bold rounded-full h-5 w-5 flex items-center justify-center animate-in zoom-in-75">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-5 space-y-3">
            <Link
              href="/categories/beauty"
              onClick={() => setMobileMenuOpen(false)}
              className="block font-medium text-neutral-800 hover:text-rose-600"
            >
              Beauty & Fragrance
            </Link>
            <Link
              href="/categories/home-decor"
              onClick={() => setMobileMenuOpen(false)}
              className="block font-medium text-neutral-800 hover:text-rose-600"
            >
              Home Accents & Decor
            </Link>
            <Link
              href="/categories/kitchen"
              onClick={() => setMobileMenuOpen(false)}
              className="block font-medium text-neutral-800 hover:text-rose-600"
            >
              Kitchen & Table
            </Link>
            <Link
              href="/categories/bath-wellness"
              onClick={() => setMobileMenuOpen(false)}
              className="block font-medium text-neutral-800 hover:text-rose-600"
            >
              Bath & Wellness
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-neutral-600 hover:text-black pt-2 border-t border-neutral-100"
            >
              Admin Portal
            </Link>
          </div>
        )}
      </header>

      {/* Cart Drawer Modal */}
      <CartDrawer />
    </>
  );
}
