'use client';

import Image from 'next/image';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';
import { formatCurrency } from '@/lib/utils';

export function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, getSubtotal, getTotalSavings } = useCartStore();

  if (!isOpen) return null;

  const subtotal = getSubtotal();
  const savings = getTotalSavings();
  const freeShippingThreshold = 75;
  const progressToFreeShipping = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const remainingForFreeShipping = Math.max(freeShippingThreshold - subtotal, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-neutral-900" />
              <h2 className="text-lg font-bold text-neutral-900">Your Shopping Bag ({items.length})</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Savings Callout */}
          {savings > 0 && (
            <div className="bg-rose-50 border-b border-rose-100 px-6 py-3 flex items-center gap-2 text-rose-800 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-rose-600 shrink-0" />
              <span>You are saving {formatCurrency(savings)} compared to department store MSRP!</span>
            </div>
          )}

          {/* Free Shipping Progress */}
          <div className="px-6 py-3 bg-neutral-50 border-b border-neutral-200 text-xs">
            {remainingForFreeShipping > 0 ? (
              <p className="text-neutral-600 mb-1.5">
                Add <span className="font-bold text-neutral-900">{formatCurrency(remainingForFreeShipping)}</span> more for <span className="text-emerald-600 font-bold">FREE SHIPPING</span>
              </p>
            ) : (
              <p className="text-emerald-700 font-bold mb-1.5 flex items-center gap-1">
                ✓ You unlocked FREE STANDARD SHIPPING!
              </p>
            )}
            <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-neutral-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <ShoppingBag className="w-16 h-16 text-neutral-300 mb-4 stroke-[1.5]" />
                <h3 className="text-base font-semibold text-neutral-900 mb-1">Your bag is empty</h3>
                <p className="text-sm text-neutral-500 max-w-xs mb-6">
                  Explore our designer beauty and home accessories at off-price values.
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2.5 bg-neutral-900 text-white font-medium rounded-lg hover:bg-neutral-800 transition-colors text-sm"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={`${item.productId}-${item.variantId || 'def'}`} className="py-4 flex gap-4">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-24 bg-neutral-100 rounded-lg overflow-hidden shrink-0 border border-neutral-200">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover object-center"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        {item.brand}
                      </p>
                      <h4 className="text-sm font-semibold text-neutral-900 line-clamp-1">
                        {item.title}
                      </h4>
                      {item.variantName && (
                        <p className="text-xs text-neutral-500 mt-0.5">{item.variantName}</p>
                      )}
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-bold text-sm text-neutral-950">
                          {formatCurrency(item.price)}
                        </span>
                        {item.compareAtPrice && item.compareAtPrice > item.price && (
                          <span className="text-xs text-neutral-400 line-through">
                            {formatCurrency(item.compareAtPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity & Remove */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-neutral-300 rounded-md">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                          className="p-1 hover:bg-neutral-100 text-neutral-600 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-neutral-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                          className="p-1 hover:bg-neutral-100 text-neutral-600 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="text-neutral-400 hover:text-rose-600 p-1 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout CTA */}
          {items.length > 0 && (
            <div className="border-t border-neutral-200 px-6 py-5 bg-neutral-50 space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Estimated Shipping</span>
                  <span>{remainingForFreeShipping === 0 ? 'FREE' : formatCurrency(5.99)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>MSRP Savings</span>
                    <span>-{formatCurrency(savings)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-neutral-950 pt-2 border-t border-neutral-200">
                  <span>Total</span>
                  <span>{formatCurrency(subtotal + (remainingForFreeShipping === 0 ? 0 : 5.99))}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={() => setIsOpen(false)}
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md text-sm"
              >
                <span>Proceed to Guest Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
