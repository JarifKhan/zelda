import { Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, ShieldCheck, Banknote } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

interface OrderConfirmationProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

async function OrderReceipt({ params, searchParams }: OrderConfirmationProps) {
  const { id: orderNumber } = await params;
  const { token } = await searchParams;

  return (
    <div className="bg-white rounded-3xl border border-neutral-200/80 p-8 sm:p-12 shadow-sm text-center space-y-6">
      {/* Success Icon */}
      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
          Order Confirmed & Stock Reserved
        </span>
        <h1 className="text-3xl font-serif font-black text-neutral-950 mt-1">
          Thank You for Your Order!
        </h1>
        <p className="text-sm text-neutral-600 mt-2">
          Your order <span className="font-mono font-bold text-neutral-900">{orderNumber}</span> has been received and registered in our dispatch system.
        </p>
      </div>

      {/* Payment Notice / COD Instructions */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 text-left space-y-3">
        <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm">
          <Banknote className="w-5 h-5 text-emerald-600" />
          <span>Next Steps & Delivery Information</span>
        </div>
        <p className="text-xs text-neutral-600 leading-relaxed">
          If you selected <strong>Cash on Delivery (COD)</strong>, our dispatch carrier will contact your phone prior to arrival. Please ensure you have the payment amount ready.
        </p>
        <p className="text-xs text-neutral-600 leading-relaxed">
          If you selected <strong>Bank Transfer</strong>, please wire the funds quoting order number <code className="bg-neutral-200 px-1 py-0.5 rounded">{orderNumber}</code>.
        </p>
        {token && (
          <div className="pt-2 border-t border-neutral-200 text-[11px] text-neutral-400">
            Security Reference: <span className="font-mono">{token}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          href="/"
          className="w-full sm:w-auto bg-neutral-950 hover:bg-neutral-800 text-white font-bold py-3.5 px-8 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/admin"
          className="w-full sm:w-auto bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold py-3.5 px-6 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-4 h-4 text-neutral-600" />
          <span>View in Admin Dashboard</span>
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage(props: OrderConfirmationProps) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/50">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <Suspense fallback={
          <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center text-sm text-neutral-500">
            Loading order receipt...
          </div>
        }>
          <OrderReceipt {...props} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
