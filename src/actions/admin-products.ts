'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { isSupabaseAvailable } from '@/lib/supabase/health';
import { getLocalProducts, saveLocalCustomProducts, getCategories } from '@/lib/services/catalog';
import { Product } from '@/types';

export interface CreateProductData {
  title: string;
  brand: string;
  description?: string;
  category_id?: string;
  price: number;
  compare_at_price?: number;
  stock: number;
  images: string[];
}

export interface UpdateProductData {
  title?: string;
  price?: number;
  compare_at_price?: number;
  brand?: string;
  description?: string;
  category_id?: string;
  images?: string[];
  stock?: number;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function getSupabaseClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hasServiceKey =
    serviceKey &&
    !serviceKey.includes('placeholder') &&
    serviceKey.length > 20;

  if (hasServiceKey) {
    return createAdminClient();
  }
  return await createServerClient();
}

/**
 * Creates a new product with linked variant (Supabase or local persistent fallback).
 */
export async function createProduct(data: CreateProductData): Promise<{ success: boolean; product?: Product; error?: string }> {
  try {
    const isOnline = await isSupabaseAvailable();

    let baseSlug = slugify(data.title);
    if (!baseSlug) {
      baseSlug = `item-${Math.random().toString(36).substring(2, 7)}`;
    }
    const finalSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    const productId = crypto.randomUUID();
    const stockQuantity = Math.max(0, Math.floor(Number(data.stock || 0)));

    if (isOnline) {
      try {
        const supabase = await getSupabaseClient();
        const { data: newProduct, error: prodError } = await supabase
          .from('products')
          .insert({
            id: productId,
            title: data.title.trim(),
            slug: finalSlug,
            description: data.description?.trim() || '',
            brand: data.brand.trim(),
            price: Number(data.price),
            compare_at_price: data.compare_at_price ? Number(data.compare_at_price) : null,
            category_id: data.category_id || null,
            images: data.images && data.images.length > 0 ? data.images : [],
            is_active: true,
            is_featured: false,
            attributes: {},
          })
          .select('*, category:categories(*)')
          .single();

        if (prodError) throw new Error(prodError.message);

        const sku = `SKU-${productId.substring(0, 8).toUpperCase()}`;
        const { data: newVariant } = await supabase
          .from('product_variants')
          .insert({
            id: crypto.randomUUID(),
            product_id: productId,
            sku,
            name: 'Standard',
            price: Number(data.price),
            compare_at_price: data.compare_at_price ? Number(data.compare_at_price) : null,
            stock_quantity: stockQuantity,
            attributes: {},
          })
          .select()
          .single();

        const fullProduct: Product = {
          ...newProduct,
          variants: newVariant ? [newVariant] : [],
        };

        revalidatePath('/admin');
        revalidatePath('/');
        return { success: true, product: fullProduct };
      } catch (err) {
        console.warn('Supabase create failed, saving to local store:', err);
      }
    }

    // Local fallback persistence
    const categories = await getCategories();
    const matchingCat = categories.find((c) => c.id === data.category_id);

    const newProduct: Product = {
      id: productId,
      title: data.title.trim(),
      slug: finalSlug,
      description: data.description?.trim() || '',
      brand: data.brand.trim(),
      price: Number(data.price),
      compare_at_price: data.compare_at_price ? Number(data.compare_at_price) : null,
      category_id: data.category_id || null,
      category: matchingCat,
      images: data.images && data.images.length > 0 ? data.images : ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'],
      is_active: true,
      is_featured: false,
      attributes: {},
      variants: [
        {
          id: `var-${productId.substring(0, 8)}`,
          product_id: productId,
          sku: `SKU-${productId.substring(0, 8).toUpperCase()}`,
          name: 'Standard',
          price: Number(data.price),
          compare_at_price: data.compare_at_price ? Number(data.compare_at_price) : null,
          stock_quantity: stockQuantity,
          attributes: {},
        },
      ],
    };

    const currentLocal = await getLocalProducts();
    await saveLocalCustomProducts([newProduct, ...currentLocal]);

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, product: newProduct };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create product';
    return { success: false, error: message };
  }
}

/**
 * Updates a product's details and primary stock.
 */
export async function updateProduct(id: string, data: UpdateProductData): Promise<{ success: boolean; error?: string }> {
  try {
    const isOnline = await isSupabaseAvailable();

    if (isOnline) {
      try {
        const supabase = await getSupabaseClient();
        const productUpdates: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };

        if (data.title !== undefined) productUpdates.title = data.title.trim();
        if (data.price !== undefined) productUpdates.price = Number(data.price);
        if (data.compare_at_price !== undefined) {
          productUpdates.compare_at_price =
            data.compare_at_price !== null && data.compare_at_price !== undefined
              ? Number(data.compare_at_price)
              : null;
        }
        if (data.brand !== undefined) productUpdates.brand = data.brand.trim();
        if (data.description !== undefined) productUpdates.description = data.description.trim();
        if (data.category_id !== undefined) productUpdates.category_id = data.category_id || null;
        if (data.images !== undefined) productUpdates.images = data.images;

        const { error: prodError } = await supabase
          .from('products')
          .update(productUpdates)
          .eq('id', id);

        if (prodError) throw new Error(prodError.message);

        if (data.stock !== undefined) {
          const stockQuantity = Math.max(0, Math.floor(Number(data.stock)));
          const { data: variants } = await supabase
            .from('product_variants')
            .select('id')
            .eq('product_id', id);

          if (variants && variants.length > 0) {
            await supabase
              .from('product_variants')
              .update({ stock_quantity: stockQuantity })
              .eq('id', variants[0].id);
          }
        }

        revalidatePath('/admin');
        revalidatePath('/');
        return { success: true };
      } catch (err) {
        console.warn('Supabase update failed, updating local store:', err);
      }
    }

    // Local fallback update
    const all = await getLocalProducts();
    const categories = await getCategories();
    const matchingCat = data.category_id ? categories.find((c) => c.id === data.category_id) : undefined;

    const updatedList = all.map((p) => {
      if (p.id !== id) return p;

      const updatedVariants = p.variants?.map((v, i) =>
        i === 0 && data.stock !== undefined
          ? { ...v, stock_quantity: Math.max(0, Math.floor(Number(data.stock))) }
          : v
      ) || [
        {
          id: `var-${id.substring(0, 8)}`,
          product_id: id,
          sku: `SKU-${id.substring(0, 8).toUpperCase()}`,
          name: 'Standard',
          price: data.price ? Number(data.price) : p.price,
          stock_quantity: data.stock !== undefined ? Math.max(0, Math.floor(Number(data.stock))) : 15,
          attributes: {},
        },
      ];

      return {
        ...p,
        title: data.title !== undefined ? data.title.trim() : p.title,
        brand: data.brand !== undefined ? data.brand.trim() : p.brand,
        description: data.description !== undefined ? data.description.trim() : p.description,
        price: data.price !== undefined ? Number(data.price) : p.price,
        compare_at_price:
          data.compare_at_price !== undefined
            ? data.compare_at_price
              ? Number(data.compare_at_price)
              : null
            : p.compare_at_price,
        category_id: data.category_id !== undefined ? data.category_id || null : p.category_id,
        category: matchingCat || p.category,
        images: data.images !== undefined ? data.images : p.images,
        variants: updatedVariants,
      };
    });

    await saveLocalCustomProducts(updatedList);

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update product';
    return { success: false, error: message };
  }
}

/**
 * Deletes a product from database or local store.
 */
export async function deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const isOnline = await isSupabaseAvailable();

    if (isOnline) {
      try {
        const supabase = await getSupabaseClient();
        await supabase.from('product_variants').delete().eq('product_id', id);
        const { error: prodError } = await supabase.from('products').delete().eq('id', id);
        if (prodError) throw new Error(prodError.message);

        revalidatePath('/admin');
        revalidatePath('/');
        return { success: true };
      } catch (err) {
        console.warn('Supabase delete failed, removing locally:', err);
      }
    }

    // Local fallback delete
    const all = await getLocalProducts();
    const remaining = all.filter((p) => p.id !== id);
    // Mark as deleted to ensure override of base mock
    const withDeletedMarker = [...remaining, { id, is_deleted: true } as unknown as Product];
    await saveLocalCustomProducts(withDeletedMarker);

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete product';
    return { success: false, error: message };
  }
}

/**
 * Adjusts inventory stock for a product variant.
 */
export async function adjustStockAction(productId: string, variantId: string, delta: number): Promise<{ success: boolean; error?: string }> {
  try {
    const isOnline = await isSupabaseAvailable();

    if (isOnline) {
      try {
        const supabase = await getSupabaseClient();
        const { data: v } = await supabase
          .from('product_variants')
          .select('stock_quantity')
          .eq('id', variantId)
          .single();

        if (v) {
          const newQty = Math.max(0, (v.stock_quantity || 0) + delta);
          await supabase
            .from('product_variants')
            .update({ stock_quantity: newQty })
            .eq('id', variantId);
        }

        revalidatePath('/admin');
        return { success: true };
      } catch (err) {
        console.warn('Supabase adjust stock failed, falling back locally:', err);
      }
    }

    // Local adjust stock
    const all = await getLocalProducts();
    const updated = all.map((p) => {
      if (p.id !== productId || !p.variants) return p;
      return {
        ...p,
        variants: p.variants.map((v) => {
          if (v.id !== variantId) return v;
          return {
            ...v,
            stock_quantity: Math.max(0, v.stock_quantity + delta),
          };
        }),
      };
    });

    await saveLocalCustomProducts(updated);
    revalidatePath('/admin');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to adjust stock';
    return { success: false, error: message };
  }
}
