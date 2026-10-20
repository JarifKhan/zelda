import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CheckoutForm } from '@/components/CheckoutForm';

export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-black transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-serif font-black text-neutral-950">
              Secure Checkout
            </h1>
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-neutral-600 bg-white border border-neutral-200 px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Encrypted & Verified Transaction</span>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <Suspense fallback={
          <div className="p-16 text-center text-sm text-neutral-500 bg-white rounded-3xl border border-neutral-200">
            Loading secure checkout...
          </div>
        }>
          <CheckoutForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
