'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { ChevronDown, X, SlidersHorizontal, ArrowRight, Loader2 } from 'lucide-react';
import { Category } from '@/types';

export interface FilterBarProps {
  categories?: Category[];
  totalProducts?: number;
  pageSize?: number;
  activeCategorySlug?: string;
  className?: string;
  showSort?: boolean;
}

const SIZE_OPTIONS = [
  { label: 'All Sizes', value: '' },
  { label: 'Small (S)', value: 'S' },
  { label: 'Medium (M)', value: 'M' },
  { label: 'Large (L)', value: 'L' },
  { label: 'XL', value: 'XL' },
  { label: 'Size 36', value: '36' },
  { label: 'Size 38', value: '38' },
  { label: 'Size 40', value: '40' },
  { label: 'Size 42', value: '42' },
];

const COLOR_OPTIONS = [
  { label: 'All Colors', value: '' },
  { label: 'Black', value: 'black' },
  { label: 'White', value: 'white' },
  { label: 'Red / Crimson', value: 'red' },
  { label: 'Green / Emerald', value: 'green' },
  { label: 'Blue / Navy', value: 'blue' },
  { label: 'Gold / Beige', value: 'gold' },
  { label: 'Wine Maroon', value: 'maroon' },
  { label: 'Charcoal', value: 'charcoal' },
];

const PRICE_OPTIONS = [
  { label: 'All Prices', value: '' },
  { label: 'Under $35', value: 'under_35' },
  { label: '$35 – $60', value: '35_60' },
  { label: '$60 – $100', value: '60_100' },
  { label: 'Over $100', value: 'over_100' },
];

const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Newest Arrivals', value: 'newest' },
];

export function FilterBar({
  categories = [],
  totalProducts = 0,
  pageSize = 12,
  activeCategorySlug,
  className = '',
  showSort = true,
}: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Current query state
  const activeSort = searchParams.get('sort') || searchParams.get('sortBy') || 'featured';
  const activeSize = searchParams.get('size') || '';
  const activeColor = searchParams.get('color') || '';
  const activePrice = searchParams.get('price') || '';
  const activeCategory = activeCategorySlug || searchParams.get('category') || '';
  const isViewingAll = searchParams.get('viewAll') === 'true';

  const hasActiveFilters = Boolean(
    activeSize ||
    activeColor ||
    activePrice ||
    (activeCategory && activeCategory !== activeCategorySlug) ||
    (showSort && activeSort !== 'featured')
  );

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== 'all') {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (name: string, value: string) => {
    startTransition(() => {
      const qs = createQueryString(name, value);
      router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
    });
  };

  const handleClearAll = () => {
    startTransition(() => {
      const params = new URLSearchParams();
      if (activeCategorySlug) {
        // preserve current page slug
      }
      router.push(pathname, { scroll: false });
    });
  };

  const handleToggleViewAll = () => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (isViewingAll) {
        params.delete('viewAll');
      } else {
        params.set('viewAll', 'true');
      }
      const qs = params.toString();
      router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
    });
  };

  // Pagination calculation: '1 / X > View All'
  const calculatedTotalPages = Math.max(1, Math.ceil(totalProducts / pageSize));
  const displayPages = isViewingAll ? 1 : calculatedTotalPages;

  return (
    <div
      className={`w-full border-b border-neutral-200/90 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-theme-ink ${className}`}
    >
      {/* Left Area: Horizontal Row of Dropdowns */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        
        {/* Size Filter Dropdown */}
        <div className="relative inline-flex items-center">
          <label htmlFor="filter-size" className="sr-only">Filter by Size</label>
          <select
            id="filter-size"
            value={activeSize}
            onChange={(e) => handleFilterChange('size', e.target.value)}
            className={`appearance-none bg-transparent text-xs font-bold uppercase tracking-wider py-1.5 pl-1 pr-6 border-b cursor-pointer transition-colors focus:outline-hidden ${
              activeSize
                ? 'border-theme-ink text-theme-ink font-black'
                : 'border-neutral-300 text-neutral-600 hover:border-neutral-500 hover:text-theme-ink'
            }`}
          >
            {SIZE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="text-theme-ink bg-white font-normal">
                {opt.value ? `Size: ${opt.label}` : 'Size'}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-0.5 pointer-events-none" />
        </div>

        {/* Color Filter Dropdown */}
        <div className="relative inline-flex items-center">
          <label htmlFor="filter-color" className="sr-only">Filter by Color</label>
          <select
            id="filter-color"
            value={activeColor}
            onChange={(e) => handleFilterChange('color', e.target.value)}
            className={`appearance-none bg-transparent text-xs font-bold uppercase tracking-wider py-1.5 pl-1 pr-6 border-b cursor-pointer transition-colors focus:outline-hidden ${
              activeColor
                ? 'border-theme-ink text-theme-ink font-black'
                : 'border-neutral-300 text-neutral-600 hover:border-neutral-500 hover:text-theme-ink'
            }`}
          >
            {COLOR_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="text-theme-ink bg-white font-normal">
                {opt.value ? `Color: ${opt.label}` : 'Color'}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-0.5 pointer-events-none" />
        </div>

        {/* Price Filter Dropdown */}
        <div className="relative inline-flex items-center">
          <label htmlFor="filter-price" className="sr-only">Filter by Price</label>
          <select
            id="filter-price"
            value={activePrice}
            onChange={(e) => handleFilterChange('price', e.target.value)}
            className={`appearance-none bg-transparent text-xs font-bold uppercase tracking-wider py-1.5 pl-1 pr-6 border-b cursor-pointer transition-colors focus:outline-hidden ${
              activePrice
                ? 'border-theme-ink text-theme-ink font-black'
                : 'border-neutral-300 text-neutral-600 hover:border-neutral-500 hover:text-theme-ink'
            }`}
          >
            {PRICE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="text-theme-ink bg-white font-normal">
                {opt.value ? `Price: ${opt.label}` : 'Price'}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-0.5 pointer-events-none" />
        </div>

        {/* Category Filter Dropdown */}
        <div className="relative inline-flex items-center">
          <label htmlFor="filter-category" className="sr-only">Filter by Category</label>
          <select
            id="filter-category"
            value={activeCategory}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className={`appearance-none bg-transparent text-xs font-bold uppercase tracking-wider py-1.5 pl-1 pr-6 border-b cursor-pointer transition-colors focus:outline-hidden ${
              activeCategory && activeCategory !== activeCategorySlug
                ? 'border-theme-ink text-theme-ink font-black'
                : 'border-neutral-300 text-neutral-600 hover:border-neutral-500 hover:text-theme-ink'
            }`}
          >
            <option value="" className="text-theme-ink bg-white font-normal">Category: All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug} className="text-theme-ink bg-white font-normal">
                {c.parent_id ? `— ${c.name}` : c.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-0.5 pointer-events-none" />
        </div>

        {/* Sort By Dropdown (Rendered when showSort is enabled) */}
        {showSort && (
          <div className="relative inline-flex items-center">
            <label htmlFor="filter-sort" className="sr-only">Sort Products</label>
            <select
              id="filter-sort"
              value={activeSort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className={`appearance-none bg-transparent text-xs font-bold uppercase tracking-wider py-1.5 pl-1 pr-6 border-b cursor-pointer transition-colors focus:outline-hidden ${
                activeSort !== 'featured'
                  ? 'border-theme-ink text-theme-ink font-black'
                  : 'border-neutral-300 text-neutral-600 hover:border-neutral-500 hover:text-theme-ink'
              }`}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="text-theme-ink bg-white font-normal">
                  Sort: {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-0.5 pointer-events-none" />
          </div>
        )}

        {/* Reset / Clear Filters Pill */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-theme-primary hover:text-theme-primary-hover transition-colors underline cursor-pointer ml-1"
          >
            <X className="w-3 h-3" />
            <span>Clear Filters</span>
          </button>
        )}

        {/* Pending Spinner Indicator */}
        {isPending && (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-400 ml-1" />
        )}
      </div>

      {/* Right Area: '1 / X > View All' Pagination & Count Indicator */}
      <div className="flex items-center gap-3 text-xs font-semibold text-neutral-500 whitespace-nowrap self-end md:self-auto">
        <span className="text-neutral-400">
          Showing <strong className="text-theme-ink font-bold">{totalProducts}</strong> {totalProducts === 1 ? 'item' : 'items'}
        </span>

        <span className="text-neutral-300 font-normal">|</span>

        <div className="flex items-center gap-1.5 text-theme-ink">
          <span className="font-mono text-neutral-700">
            1 / {displayPages}
          </span>
          <span className="text-neutral-400">&gt;</span>
          <button
            type="button"
            onClick={handleToggleViewAll}
            className="text-xs font-bold text-neutral-800 hover:text-theme-primary transition-colors cursor-pointer hover:underline"
          >
            {isViewingAll ? 'Paginated View' : 'View All'}
          </button>
        </div>
      </div>
    </div>
  );
}
