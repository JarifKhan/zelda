'use client';

import Link from 'next/link';
import { ShieldCheck, Truck, RotateCcw, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-neutral-950 text-neutral-300 border-t border-neutral-900 mt-20">
      {/* Value Pillars */}
      <div className="border-b border-neutral-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-sm">Genuine Designer Goods</h4>
              <p className="text-xs text-neutral-400 mt-1">
                Authentic excess inventory sourced directly from premier department brands.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Truck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-sm">Fast Dispatch & Free Ship</h4>
              <p className="text-xs text-neutral-400 mt-1">
                Free standard shipping on all qualifying orders over $75.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-sm">Cash on Delivery & Secure Pay</h4>
              <p className="text-xs text-neutral-400 mt-1">
                Zero upfront risk: pay safely in cash when your parcel arrives.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <RotateCcw className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-sm">Hassle-Free Returns</h4>
              <p className="text-xs text-neutral-400 mt-1">
                30-day return policy on unused beauty and home accessories.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <span className="text-2xl font-black tracking-tight text-white font-serif">
            ZELDA & CO.
          </span>
          <p className="text-xs text-rose-500 font-bold uppercase tracking-widest mt-0.5">
            Off-Price Beauty & Home
          </p>
          <p className="text-xs text-neutral-400 mt-4 leading-relaxed">
            The thrill of the treasure hunt. Discover curated designer skincare, prestige perfumes, artisanal candles, and luxe home decor at unbeatable prices.
          </p>
        </div>

        <div>
          <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Categories</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/categories/beauty" className="hover:text-white transition-colors">
                Beauty & Fragrances
              </Link>
            </li>
            <li>
              <Link href="/categories/home-decor" className="hover:text-white transition-colors">
                Home Accents & Candles
              </Link>
            </li>
            <li>
              <Link href="/categories/kitchen" className="hover:text-white transition-colors">
                Kitchen & Entertaining
              </Link>
            </li>
            <li>
              <Link href="/categories/bath-wellness" className="hover:text-white transition-colors">
                Bath & Wellness
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Customer Care</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/#faq" className="hover:text-white transition-colors">
                Shipping & Delivery Guide
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="hover:text-white transition-colors">
                Cash on Delivery Terms
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="hover:text-white transition-colors">
                Track Order
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-white transition-colors text-neutral-400">
                Admin Control Room
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Treasure Alerts</h4>
          <p className="text-xs text-neutral-400 mb-3 leading-relaxed">
            New markdowns drop weekly. Sign up to get first access before limited inventory sells out.
          </p>
          <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-neutral-900 border border-neutral-800 text-xs text-white px-3 py-2 rounded-lg flex-1 focus:outline-hidden focus:border-rose-500"
            />
            <button
              type="submit"
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
            >
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-neutral-900 py-6 text-center text-xs text-neutral-500">
        <p>© 2026 ZELDA & CO. All Rights Reserved. Built with Next.js, Supabase & PostgreSQL.</p>
      </div>
    </footer>
  );
}
