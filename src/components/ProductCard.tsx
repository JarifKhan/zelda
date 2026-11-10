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
  const primaryImage = product.images[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
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
    <div className="group relative flex flex-col bg-white border border-neutral-200/80 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300">
      
      {/* Top Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {savingsPercent && (
          <span className="bg-theme-secondary/25 backdrop-blur-md text-theme-ink text-[11px] font-bold tracking-wider px-2.5 py-1 rounded-md border border-theme-secondary/40 shadow-2xs">
            Save {savingsPercent}%
          </span>
        )}
        {product.is_featured && (
          <span className="bg-white/95 backdrop-blur-md text-theme-ink text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-md border border-neutral-200/80 shadow-2xs flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-theme-primary" /> Featured
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
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="font-semibold text-theme-ink group-hover:text-theme-primary transition-colors text-sm line-clamp-2 leading-snug mb-2">
            {product.title}
          </h3>
        </Link>

        {/* Category-specific attribute pill */}
        <div className="text-xs text-theme-ink mb-3 flex flex-wrap gap-1">
          {product.attributes.fabric && (
            <span className="bg-theme-secondary/20 text-theme-ink px-2 py-0.5 rounded text-[11px] font-medium truncate max-w-[200px]">
              {String(product.attributes.fabric)}
            </span>
          )}
          {product.attributes.duration && (
            <span className="bg-theme-secondary/20 text-theme-ink px-2 py-0.5 rounded text-[11px] font-medium">
              ⏱ {String(product.attributes.duration)}
            </span>
          )}
          {product.attributes.material && !product.attributes.fabric && (
            <span className="bg-theme-secondary/20 text-theme-ink px-2 py-0.5 rounded text-[11px] font-medium truncate max-w-[200px]">
              {String(product.attributes.material)}
            </span>
          )}
          {product.attributes.style && (
            <span className="bg-theme-secondary/20 text-theme-ink px-2 py-0.5 rounded text-[11px]">
              {String(product.attributes.style)}
            </span>
          )}
          {product.attributes.volume && (
            <span className="bg-theme-secondary/20 text-theme-ink px-2 py-0.5 rounded text-[11px]">
              {String(product.attributes.volume)}
            </span>
          )}
        </div>

        {/* Pricing Stack */}
        <div className="mt-auto pt-2 border-t border-neutral-100 flex items-baseline justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-theme-ink">
                {formatCurrency(product.price)}
              </span>
              {product.compare_at_price && (
                <span className="text-xs text-neutral-500 line-through">
                  Comp: {formatCurrency(product.compare_at_price)}
                </span>
              )}
            </div>
          </div>

          {/* Quick Add Button */}
          <button
            onClick={handleQuickAdd}
            className="p-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover transition-colors flex items-center justify-center shadow-xs cursor-pointer"
            aria-label={`Add ${product.title} to bag`}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
