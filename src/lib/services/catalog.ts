import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@/lib/supabase/server';
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '@/lib/data/mock-products';
import { Category, Product } from '@/types';
import { isSupabaseAvailable } from '@/lib/supabase/health';

const CUSTOM_PRODUCTS_FILE = path.join(process.cwd(), 'src', 'lib', 'data', 'custom-products.json');

export async function getLocalProducts(): Promise<Product[]> {
  try {
    const raw = await fs.readFile(CUSTOM_PRODUCTS_FILE, 'utf-8');
    const custom: (Product & { is_deleted?: boolean })[] = JSON.parse(raw);

    const customIds = new Set(custom.map((c) => c.id));
    const deletedIds = new Set(custom.filter((c) => c.is_deleted).map((c) => c.id));

    // Base mock products that haven't been modified or deleted
    const baseRemaining = MOCK_PRODUCTS.filter(
      (p) => !customIds.has(p.id) && !deletedIds.has(p.id)
    );

    // Active custom/modified products
    const activeCustom = custom.filter((c) => !c.is_deleted);

    return [...activeCustom, ...baseRemaining];
  } catch {
    return [...MOCK_PRODUCTS];
  }
}

export async function saveLocalCustomProducts(products: (Product & { is_deleted?: boolean })[]): Promise<void> {
  try {
    await fs.writeFile(CUSTOM_PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save custom products:', err);
  }
}

export async function getCategories(): Promise<Category[]> {
  const available = await isSupabaseAvailable();
  if (!available) {
    return MOCK_CATEGORIES;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error || !data || data.length === 0) {
      return MOCK_CATEGORIES;
    }
    return data;
  } catch {
    return MOCK_CATEGORIES;
  }
}

export interface GetProductsOptions {
  categorySlug?: string;
  isFeatured?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  limit?: number;
  sortBy?: 'featured' | 'price_asc' | 'price_desc' | 'newest';
  size?: string;
  color?: string;
}

function matchesProductSize(p: Product, targetSize: string): boolean {
  if (!targetSize) return true;
  const norm = targetSize.trim().toLowerCase();
  const searchTerms = [norm];
  if (norm === 's') searchTerms.push('small');
  if (norm === 'm') searchTerms.push('medium');
  if (norm === 'l') searchTerms.push('large');
  if (norm === 'xl') searchTerms.push('extra large');

  const checkText = (text?: unknown) => {
    if (!text) return false;
    const str = String(text).toLowerCase();
    return searchTerms.some((term) => {
      return (
        str === term ||
        str.startsWith(`${term} `) ||
        str.includes(` ${term} `) ||
        str.includes(`(${term})`) ||
        str.includes(`size ${term}`)
      );
    });
  };

  if (checkText(p.attributes?.size)) return true;
  return p.variants?.some((v) => checkText(v.attributes?.size) || checkText(v.name)) || false;
}

function matchesProductColor(p: Product, targetColor: string): boolean {
  if (!targetColor) return true;
  const norm = targetColor.trim().toLowerCase();
  const checkText = (text?: unknown) => {
    if (!text) return false;
    return String(text).toLowerCase().includes(norm);
  };

  if (checkText(p.attributes?.color) || checkText(p.attributes?.shade)) return true;
  return (
    p.variants?.some(
      (v) =>
        checkText(v.attributes?.color) ||
        checkText(v.attributes?.stone_color) ||
        checkText(v.attributes?.shade) ||
        checkText(v.name)
    ) || false
  );
}

export async function getProducts(options?: GetProductsOptions): Promise<Product[]> {
  const available = await isSupabaseAvailable();
  if (!available) {
    let results = await getLocalProducts();

    if (options?.categorySlug) {
      const cat = MOCK_CATEGORIES.find((c) => c.slug === options.categorySlug);
      if (cat) {
        const catIds = new Set<string>([cat.id]);
        MOCK_CATEGORIES.filter((c) => c.parent_id === cat.id).forEach((c) => catIds.add(c.id));
        results = results.filter((p) => (p.category_id && catIds.has(p.category_id)) || p.category?.slug === options.categorySlug);
      } else {
        results = [];
      }
    }

    if (options?.isFeatured) {
      results = results.filter((p) => p.is_featured);
    }

    if (options?.search) {
      const q = options.search.toLowerCase();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (options?.minPrice !== undefined) {
      results = results.filter((p) => p.price >= options.minPrice!);
    }

    if (options?.maxPrice !== undefined) {
      results = results.filter((p) => p.price <= options.maxPrice!);
    }

    if (options?.brand) {
      results = results.filter((p) => p.brand.toLowerCase() === options.brand!.toLowerCase());
    }

    if (options?.size) {
      results = results.filter((p) => matchesProductSize(p, options.size!));
    }

    if (options?.color) {
      results = results.filter((p) => matchesProductColor(p, options.color!));
    }

    // Sort order logic
    if (options?.sortBy) {
      switch (options.sortBy) {
        case 'price_asc':
          results.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          results.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          results.sort(
            (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
          );
          break;
        case 'featured':
        default:
          results.sort((a, b) => {
            if (a.is_featured === b.is_featured) {
              return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
            }
            return a.is_featured ? -1 : 1;
          });
          break;
      }
    } else {
      results.sort((a, b) => {
        if (a.is_featured === b.is_featured) {
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        }
        return a.is_featured ? -1 : 1;
      });
    }

    if (options?.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  try {
    const supabase = await createClient();
    let query = supabase
      .from('products')
      .select('*, category:categories(*), variants:product_variants(*)')
      .eq('is_active', true);

    if (options?.categorySlug) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', options.categorySlug)
        .single();

      if (cat) {
        const { data: subcats } = await supabase
          .from('categories')
          .select('id')
          .eq('parent_id', cat.id);
        const catIds = [cat.id, ...(subcats || []).map((s: { id: string }) => s.id)];
        query = query.in('category_id', catIds);
      } else {
        return [];
      }
    }

    if (options?.isFeatured) {
      query = query.eq('is_featured', true);
    }

    if (options?.search) {
      query = query.ilike('title', `%${options.search}%`);
    }

    if (options?.minPrice !== undefined) {
      query = query.gte('price', options.minPrice);
    }

    if (options?.maxPrice !== undefined) {
      query = query.lte('price', options.maxPrice);
    }

    if (options?.brand) {
      query = query.eq('brand', options.brand);
    }

    if (options?.size) {
      query = query.filter('attributes->>size', 'ilike', `%${options.size}%`);
    }

    if (options?.color) {
      query = query.filter('attributes->>color', 'ilike', `%${options.color}%`);
    }

    // Apply sorting
    if (options?.sortBy) {
      switch (options.sortBy) {
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'featured':
        default:
          query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
          break;
      }
    } else {
      query = query.order('created_at', { ascending: false });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return await getLocalProducts();
    }
    return data;
  } catch {
    return await getLocalProducts();
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const available = await isSupabaseAvailable();
  if (!available) {
    const all = await getLocalProducts();
    const p = all.find((item) => item.slug === slug);
    return p || null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), variants:product_variants(*)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      const all = await getLocalProducts();
      const p = all.find((item) => item.slug === slug);
      return p || null;
    }
    return data;
  } catch {
    const all = await getLocalProducts();
    const p = all.find((item) => item.slug === slug);
    return p || null;
  }
}
