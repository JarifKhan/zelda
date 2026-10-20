'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingBag, ShieldCheck, Truck, Sparkles, AlertCircle, Check } from 'lucide-react';
import { Product, ProductVariant } from '@/types';
import { formatCurrency, calculateSavingsPercent } from '@/lib/utils';
import { useCartStore } from '@/lib/store/cart';

interface ProductDetailViewProps {
  product: Product;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants?.[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const { addItem } = useCartStore();

  const activePrice = selectedVariant?.price ?? product.price;
  const activeCompareAt = selectedVariant?.compare_at_price ?? product.compare_at_price;
  const savingsPercent = calculateSavingsPercent(activePrice, activeCompareAt);
  const savingsDollar = activeCompareAt && activeCompareAt > activePrice ? activeCompareAt - activePrice : null;
  const activeStock = selectedVariant?.stock_quantity ?? 15;
  const primaryImage = product.images[0] || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80';

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id,
      title: product.title,
      variantName: selectedVariant?.name,
      brand: product.brand,
      price: activePrice,
      compareAtPrice: activeCompareAt,
      image: primaryImage,
      quantity,
      maxStock: activeStock,
      attributes: {
        ...product.attributes,
        ...(selectedVariant?.attributes || {}),
      },
    });

    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
      {/* Media Gallery */}
      <div className="space-y-4">
        <div className="relative aspect-4/5 w-full bg-neutral-100 rounded-2xl overflow-hidden border border-neutral-200 shadow-sm">
          <Image
            src={primaryImage}
            alt={product.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center"
          />
          {savingsPercent && (
            <div className="absolute top-4 left-4 bg-rose-600 text-white font-black text-xs px-3 py-1.5 rounded-lg shadow-md uppercase tracking-wider">
              Save {savingsPercent}% vs MSRP
            </div>
          )}
        </div>
      </div>

      {/* Product Details & Purchase Form */}
      <div className="flex flex-col space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
            {product.brand}
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-neutral-950 mt-1 leading-snug">
            {product.title}
          </h1>
        </div>

        {/* Pricing Stack (TJ Maxx style) */}
        <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200/80 space-y-2">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-black text-neutral-950">
              {formatCurrency(activePrice)}
            </span>
            {activeCompareAt && (
              <span className="text-base text-neutral-400 line-through">
                MSRP: {formatCurrency(activeCompareAt)}
              </span>
            )}
          </div>
          {savingsDollar && (
            <p className="text-xs font-bold text-rose-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              You save {formatCurrency(savingsDollar)} ({savingsPercent}% off regular department retail)
            </p>
          )}
        </div>

        {/* Variant Selector */}
        {product.variants && product.variants.length > 1 && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
              Select Option / Variant:
            </label>
            <div className="flex flex-wrap gap-2.5">
              {product.variants.map((v) => {
                const isSelected = selectedVariant?.id === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVariant(v);
                      setQuantity(1);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                        : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400'
                    }`}
                  >
                    <span>{v.name}</span>
                    {v.price && (
                      <span className="ml-1.5 opacity-80 font-normal">
                        ({formatCurrency(v.price)})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Low Stock Warning */}
        {activeStock > 0 && activeStock <= 10 && (
          <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200/80 px-3.5 py-2.5 rounded-xl text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Treasure Alert: Only {activeStock} units remaining in stock. Fast sellout expected.</span>
          </div>
        )}

        {/* Quantity & Add to Cart */}
        <div className="space-y-3 pt-2">
          <div className="flex gap-4">
            <div className="flex items-center border border-neutral-300 rounded-xl bg-white px-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-10 flex items-center justify-center text-neutral-600 hover:text-black font-bold"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="w-8 text-center text-sm font-bold text-neutral-900">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(activeStock, quantity + 1))}
                className="w-8 h-10 flex items-center justify-center text-neutral-600 hover:text-black font-bold"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={activeStock <= 0}
              className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                activeStock <= 0
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  : addedAnimation
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-4 h-4" /> Added to Bag!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  {activeStock > 0 ? 'Add to Bag' : 'Sold Out'}
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-neutral-500 text-center flex items-center justify-center gap-1.5 pt-1">
            <Truck className="w-3.5 h-3.5 text-neutral-400" />
            <span>Eligible for Free Standard Shipping over $75 | Cash on Delivery available</span>
          </p>
        </div>

        {/* Description & Specifications Grid */}
        <div className="border-t border-neutral-200 pt-6 space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
            Product Details & Attributes
          </h3>
          <p className="text-sm text-neutral-600 leading-relaxed">
            {product.description}
          </p>

          <dl className="grid grid-cols-2 gap-3 pt-2 text-xs">
            {Object.entries(product.attributes).map(([key, value]) => {
              if (value === undefined || value === null) return null;
              const formattedKey = key.replace(/_/g, ' ').toUpperCase();
              return (
                <div key={key} className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                  <dt className="text-neutral-400 font-semibold text-[10px] uppercase">
                    {formattedKey}
                  </dt>
                  <dd className="font-semibold text-neutral-800 mt-0.5">
                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </div>
  );
}
