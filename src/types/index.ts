export type UserRole = 'customer' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
  image_url?: string | null;
  description?: string | null;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  name: string;
  price?: number | null;
  compare_at_price?: number | null;
  stock_quantity: number;
  attributes: Record<string, string | number | boolean>;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  brand: string;
  price: number;
  compare_at_price?: number | null;
  category_id?: string | null;
  category?: Category;
  images: string[];
  is_active: boolean;
  is_featured: boolean;
  attributes: {
    // Fashion & Apparel attributes
    fabric?: string;
    material?: string;
    style?: string;
    color?: string;
    includes?: string;
    occasion?: string;
    care_instructions?: string;
    fit?: string;
    // Beauty & Cosmetics attributes
    shade?: string;
    scent?: string;
    volume?: string;
    skin_type?: string;
    key_actives?: string;
    // Salon Services attributes
    duration?: string;
    service_type?: string;
    appointment_required?: boolean;
    // Dimensions & Specifications
    dimensions?: string;
    fragile?: boolean;
    [key: string]: unknown;
  };
  variants?: ProductVariant[];
  created_at?: string;
}

export interface CartItem {
  productId: string;
  variantId?: string;
  title: string;
  variantName?: string;
  brand: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  quantity: number;
  maxStock: number;
  attributes?: Record<string, unknown>;
}

export type OrderStatus =
  | 'pending_verification'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'verifying' | 'paid' | 'refunded';

export type PaymentMethod = 'cod' | 'manual_bank' | 'stripe';

export interface ShippingAddress {
  fullName: string;
  phone: string;
  streetAddress: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string | null;
  product_title: string;
  variant_name?: string | null;
  unit_price: number;
  quantity: number;
  total_price: number;
}

export interface Order {
  id: string;
  order_number: string;
  secret_token: string;
  user_id?: string | null;
  email: string;
  phone: string;
  shipping_address: ShippingAddress;
  billing_address: ShippingAddress;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  total: number;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_details?: Record<string, unknown>;
  tracking_number?: string | null;
  admin_notes?: string | null;
  created_at: string;
  items?: OrderItem[];
}
