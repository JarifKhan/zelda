import { createClient } from '@/lib/supabase/server';
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '@/lib/data/mock-products';
import { Category, Product } from '@/types';

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && !url.includes('placeholder-url') && anonKey && !anonKey.includes('placeholder-anon-key'));
}

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) {
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

export async function getProducts(options?: {
  categorySlug?: string;
  isFeatured?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  limit?: number;
}): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    let results = [...MOCK_PRODUCTS];

    if (options?.categorySlug) {
      const cat = MOCK_CATEGORIES.find((c) => c.slug === options.categorySlug);
      if (cat) {
        results = results.filter((p) => p.category_id === cat.id);
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
        query = query.eq('category_id', cat.id);
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

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return MOCK_PRODUCTS;
    }
    return data;
  } catch {
    return MOCK_PRODUCTS;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    const p = MOCK_PRODUCTS.find((item) => item.slug === slug);
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
      const p = MOCK_PRODUCTS.find((item) => item.slug === slug);
      return p || null;
    }
    return data;
  } catch {
    const p = MOCK_PRODUCTS.find((item) => item.slug === slug);
    return p || null;
  }
}
