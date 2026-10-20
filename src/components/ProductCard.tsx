'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { Product } from '@/types';
import { formatCurrency, calculateSavingsPercent } from '@/lib/utils';
import { useCartStore } from '@/lib/store/cart';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const savingsPercent = calculateSavingsPercent(product.price, product.compare_at_price);
  const primaryImage = product.images[0] || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80';
  const defaultVariant = product.variants?.[0];

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      productId: product.id,
      variantId: defaultVariant?.id,
      title: product.title,
      variantName: defaultVariant?.name,
      brand: product.brand,
      price: defaultVariant?.price || product.price,
      compareAtPrice: defaultVariant?.compare_at_price || product.compare_at_price,
      image: primaryImage,
      maxStock: defaultVariant?.stock_quantity || 15,
      attributes: product.attributes,
    });
  };

  return (
    <div className="group relative flex flex-col bg-white border border-neutral-200/80 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
      
      {/* Top Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {savingsPercent && (
          <span className="bg-rose-600 text-white text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
            Save {savingsPercent}%
          </span>
        )}
        {product.is_featured && (
          <span className="bg-amber-400 text-neutral-950 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> Hot Deal
          </span>
        )}
      </div>

      {/* Product Image */}
      <Link href={`/products/${product.slug}`} className="relative aspect-4/5 w-full bg-neutral-100 overflow-hidden block">
        <Image
          src={primaryImage}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
      </Link>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-1">
        {/* Brand */}
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
          {product.brand}
        </p>

        {/* Title */}
        <Link href={`/products/${product.slug}`} className="group-hover:text-rose-600 transition-colors">
          <h3 className="font-semibold text-neutral-900 text-sm line-clamp-2 leading-snug mb-2">
            {product.title}
          </h3>
        </Link>

        {/* Category-specific attribute pill */}
        <div className="text-xs text-neutral-500 mb-3 flex flex-wrap gap-1">
          {product.attributes.scent && (
            <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded text-[11px]">
              {String(product.attributes.scent)}
            </span>
          )}
          {product.attributes.volume && (
            <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded text-[11px]">
              {String(product.attributes.volume)}
            </span>
          )}
          {product.attributes.material && (
            <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded text-[11px]">
              {String(product.attributes.material)}
            </span>
          )}
        </div>

        {/* Pricing Stack (TJ Maxx style) */}
        <div className="mt-auto pt-2 border-t border-neutral-100 flex items-baseline justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-neutral-950">
                {formatCurrency(product.price)}
              </span>
              {product.compare_at_price && (
                <span className="text-xs text-neutral-400 line-through">
                  Comp: {formatCurrency(product.compare_at_price)}
                </span>
              )}
            </div>
          </div>

          {/* Quick Add Button */}
          <button
            onClick={handleQuickAdd}
            className="p-2 bg-neutral-900 text-white rounded-lg hover:bg-rose-600 transition-colors flex items-center justify-center shadow-xs"
            aria-label={`Add ${product.title} to bag`}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
