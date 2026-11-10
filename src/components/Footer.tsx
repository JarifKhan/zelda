'use client';

import Link from 'next/link';
import { ShieldCheck, Truck, RotateCcw, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white text-theme-ink border-t border-neutral-200 mt-20 shadow-xs">
      {/* Value Pillars */}
      <div className="border-b border-neutral-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-theme-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-theme-ink text-sm">Authentic Designer Craft</h4>
              <p className="text-xs text-neutral-500 mt-1">
                Curated Banarasi silks, hand-embroidered suits, 22K gold-plated jewelry, and prestige cosmetics.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-theme-secondary shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-theme-ink text-sm">Free U.S. Shipping Over $75</h4>
              <p className="text-xs text-neutral-500 mt-1">
                Fast, insured delivery across all 50 states with real-time tracking updates.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-theme-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-theme-ink text-sm">Secure Pay & Studio Booking</h4>
              <p className="text-xs text-neutral-500 mt-1">
                Encrypted checkout, Cash on Delivery options, and seamless in-studio appointment booking.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <RotateCcw className="w-5 h-5 text-theme-secondary shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-theme-ink text-sm">Hassle-Free Returns</h4>
              <p className="text-xs text-neutral-500 mt-1">
                30-day return policy on unworn apparel, footwear, and factory-sealed beauty essentials.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-2 space-y-3">
          <span className="text-2xl font-black tracking-tight text-theme-ink font-sans">
            ZELDA & CO.
          </span>
          <p className="text-xs text-theme-primary font-bold uppercase tracking-widest">
            Apparel, Fine Jewelry & Beauty Salon
          </p>
          <p className="text-xs text-neutral-600 leading-relaxed max-w-sm">
            Your premier boutique destination for high-end South Asian and contemporary fashion, handcrafted bridal jewelry, luxury footwear, dermatologist-approved skincare, and licensed beauty studio treatments.
          </p>
        </div>

        {/* Fashion Departments */}
        <div>
          <h4 className="text-theme-ink text-sm font-bold uppercase tracking-wider mb-4">Fashion</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/categories/womens-clothing" className="text-neutral-600 hover:text-theme-primary transition-colors">
                Women's Clothing & Suits
              </Link>
            </li>
            <li>
              <Link href="/categories/sarees" className="text-neutral-600 hover:text-theme-primary transition-colors">
                Banarasi & Silk Sarees
              </Link>
            </li>
            <li>
              <Link href="/categories/mens-clothing" className="text-neutral-600 hover:text-theme-primary transition-colors">
                Men's Clothing & Shirts
              </Link>
            </li>
            <li>
              <Link href="/categories/punjabi-kurtas" className="text-neutral-600 hover:text-theme-primary transition-colors">
                Traditional Punjabi & Kurtas
              </Link>
            </li>
            <li>
              <Link href="/categories/jewelry-accessories" className="text-neutral-600 hover:text-theme-primary transition-colors">
                Kundan & Bridal Jewelry
              </Link>
            </li>
            <li>
              <Link href="/categories/footwear" className="text-neutral-600 hover:text-theme-primary transition-colors">
                Shoes & Embellished Juttis
              </Link>
            </li>
          </ul>
        </div>

        {/* Beauty & Studio */}
        <div>
          <h4 className="text-theme-ink text-sm font-bold uppercase tracking-wider mb-4">Beauty & Salon</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/categories/cosmetics" className="text-neutral-600 hover:text-theme-primary transition-colors">
                Cosmetics & Skincare
              </Link>
            </li>
            <li>
              <Link href="/categories/makeup-products" className="text-neutral-600 hover:text-theme-primary transition-colors">
                Eyeshadows & Makeup
              </Link>
            </li>
            <li>
              <Link href="/categories/pedicure" className="text-neutral-600 hover:text-theme-primary transition-colors">
                Deluxe Spa Pedicures
              </Link>
            </li>
            <li>
              <Link href="/categories/eyebrow-grooming" className="text-neutral-600 hover:text-theme-primary transition-colors">
                Eyebrow Threading & Shaping
              </Link>
            </li>
            <li>
              <Link href="/categories/salon-services" className="text-theme-primary hover:text-theme-primary-hover font-semibold transition-colors">
                Book Studio Service →
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h4 className="text-theme-ink text-sm font-bold uppercase tracking-wider mb-4">Customer Care</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <span className="text-neutral-500">U.S. Delivery: 3-5 Business Days</span>
            </li>
            <li>
              <span className="text-neutral-500">Payment: Card, COD & Studio Pay</span>
            </li>
            <li>
              <Link href="/admin" className="text-neutral-500 hover:text-theme-ink transition-colors">
                Admin Operations Portal
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-neutral-100 py-6 text-center text-xs text-neutral-400">
        <p>© 2026 ZELDA & CO. All Rights Reserved. Built with Next.js, Supabase & PostgreSQL.</p>
      </div>
    </footer>
  );
}
