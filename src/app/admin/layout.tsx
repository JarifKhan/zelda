import Link from 'next/link';
import { ShieldCheck, Package, ShoppingCart, ArrowLeft, BarChart3, Truck } from 'lucide-react';
import { AdminLogoutButton } from '@/components/AdminLogoutButton';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-theme-canvas text-theme-ink">
      {/* Admin Top Navigation */}
      <header className="bg-theme-ink text-white border-b border-neutral-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span>Storefront</span>
              </Link>
              <div className="h-5 w-px bg-neutral-700" />
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-theme-primary" />
                <span className="font-bold text-sm tracking-wide">ZELDA OPERATIONS</span>
                <span className="bg-theme-primary/20 text-theme-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  Admin
                </span>
              </div>
            </div>

            <nav className="flex items-center gap-6 text-xs font-semibold">
              <Link href="/admin" className="text-white hover:text-theme-primary transition-colors flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4" />
                <span>Overview</span>
              </Link>
              <Link href="/admin#shipping" className="text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5">
                <Truck className="w-4 h-4" />
                <span>Shipping</span>
              </Link>
              <Link href="/admin#orders" className="text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4" />
                <span>Orders</span>
              </Link>
              <Link href="/admin#inventory" className="text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5">
                <Package className="w-4 h-4" />
                <span>Catalog & Stock</span>
              </Link>
              <div className="h-5 w-px bg-neutral-700" />
              <AdminLogoutButton />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>
    </div>
  );
}
