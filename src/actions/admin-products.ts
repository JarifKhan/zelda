'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient as createServerClient } from '@/lib/supabase/server';
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

/**
 * Utility to convert title into a clean URL-friendly slug.
 */
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

/**
 * Returns Supabase admin client (if service role key is available)
 * or falls back to the server authenticated client.
 */
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
 * Creates a new product with an auto-generated slug and linked variant in Supabase.
 */
export async function createProduct(data: CreateProductData): Promise<{ success: boolean; product?: Product; error?: string }> {
  try {
    const supabase = await getSupabaseClient();

    // 1. Auto-generate URL-friendly slug from title
    let baseSlug = slugify(data.title);
    if (!baseSlug) {
      baseSlug = `item-${Math.random().toString(36).substring(2, 7)}`;
    }

    // Check for collision
    let finalSlug = baseSlug;
    const { data: existingSlug } = await supabase
      .from('products')
      .select('id')
      .eq('slug', finalSlug)
      .maybeSingle();

    if (existingSlug) {
      finalSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    // 2. Generate UUID and insert product record
    const productId = crypto.randomUUID();

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

    if (prodError) {
      return { success: false, error: prodError.message };
    }

    // 3. Create linked default variant to store stock_quantity
    const stockQuantity = Math.max(0, Math.floor(Number(data.stock || 0)));
    const sku = `SKU-${productId.substring(0, 8).toUpperCase()}`;

    const { data: newVariant, error: varError } = await supabase
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

    if (varError) {
      console.error('Failed to create default variant for product:', varError.message);
    }

    const fullProduct: Product = {
      ...newProduct,
      variants: newVariant ? [newVariant] : [],
    };

    // 4. Revalidate cache
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, product: fullProduct };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create product';
    return { success: false, error: message };
  }
}

/**
 * Updates a product's base information and primary variant stock in Supabase.
 */
export async function updateProduct(id: string, data: UpdateProductData): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await getSupabaseClient();

    // 1. Update product base fields
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

    if (prodError) {
      return { success: false, error: prodError.message };
    }

    // 2. Update stock on product variant if stock was provided
    if (data.stock !== undefined) {
      const stockQuantity = Math.max(0, Math.floor(Number(data.stock)));

      const { data: variants, error: varQueryError } = await supabase
        .from('product_variants')
        .select('id, stock_quantity')
        .eq('product_id', id);

      if (!varQueryError && variants && variants.length > 0) {
        // Update first/primary variant
        await supabase
          .from('product_variants')
          .update({ stock_quantity: stockQuantity })
          .eq('id', variants[0].id);
      } else {
        // Create default variant if none exists
        await supabase
          .from('product_variants')
          .insert({
            id: crypto.randomUUID(),
            product_id: id,
            sku: `SKU-${id.substring(0, 8).toUpperCase()}`,
            name: 'Standard',
            price: data.price ? Number(data.price) : null,
            stock_quantity: stockQuantity,
            attributes: {},
          });
      }
    }

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update product';
    return { success: false, error: message };
  }
}

/**
 * Deletes a product and its associated variants from Supabase.
 */
export async function deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await getSupabaseClient();

    // 1. Remove related variants first (if foreign key CASCADE is not set)
    await supabase.from('product_variants').delete().eq('product_id', id);

    // 2. Remove the product
    const { error: prodError } = await supabase.from('products').delete().eq('id', id);

    if (prodError) {
      return { success: false, error: prodError.message };
    }

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete product';
    return { success: false, error: message };
  }
}
