-- ==============================================================================
-- OFF-PRICE BEAUTY & HOME SHOP SCHEMA (PostgreSQL + Supabase RLS)
-- ==============================================================================

-- 1. ENUMS & EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending_verification', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('unpaid', 'verifying', 'paid', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABLES

-- Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    role user_role DEFAULT 'customer' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Products (Off-price merchandising: compare_at_price + attributes jsonb)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    brand TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    compare_at_price NUMERIC(10, 2), -- Original MSRP for "Compare At" savings
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    images TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    attributes JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Product Variants
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    price NUMERIC(10, 2), -- Overrides base price if specified
    compare_at_price NUMERIC(10, 2),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    attributes JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Orders (Supports guest checkout with secret_token)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    secret_token UUID DEFAULT gen_random_uuid() NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    shipping_address JSONB NOT NULL,
    billing_address JSONB NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    shipping_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL,
    status order_status DEFAULT 'pending_verification' NOT NULL,
    payment_method TEXT NOT NULL, -- 'cod', 'manual_bank', 'stripe'
    payment_status payment_status DEFAULT 'unpaid' NOT NULL,
    payment_details JSONB DEFAULT '{}'::jsonb,
    tracking_number TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    product_title TEXT NOT NULL,
    variant_name TEXT,
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_secret_token ON orders(secret_token);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Helper to check admin status
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles: Users can read/write their own profile; admins have full access
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id OR is_admin());

-- Categories: Public read; admin full
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (TRUE);
CREATE POLICY "Admin write categories" ON categories FOR ALL USING (is_admin());

-- Products: Public reads active; admin reads/writes all
CREATE POLICY "Public read products" ON products FOR SELECT USING (is_active = TRUE OR is_admin());
CREATE POLICY "Admin write products" ON products FOR ALL USING (is_admin());

-- Variants: Public reads; admin writes all
CREATE POLICY "Public read variants" ON product_variants FOR SELECT USING (TRUE);
CREATE POLICY "Admin write variants" ON product_variants FOR ALL USING (is_admin());

-- Orders: Users can read their own orders; admins have full access
CREATE POLICY "Users read own orders" ON orders FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Admin manage orders" ON orders FOR ALL USING (is_admin());

-- Order Items: Users read own order items; admins have full access
CREATE POLICY "Users read own order items" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR is_admin()))
);
CREATE POLICY "Admin manage order items" ON order_items FOR ALL USING (is_admin());

-- 5. AUTO-CREATE PROFILE TRIGGER ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'customer')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. ATOMIC ORDER PLACEMENT (Race-condition-proof checkout)
CREATE OR REPLACE FUNCTION place_order_atomic(
    p_order_data JSONB,
    p_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_id UUID;
    v_item JSONB;
    v_variant_id UUID;
    v_qty INT;
    v_current_stock INT;
    v_item_title TEXT;
    v_secret_token UUID;
BEGIN
    -- 1. Validate & Lock stock rows
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_variant_id := (v_item->>'variant_id')::UUID;
        v_qty := (v_item->>'quantity')::INT;

        IF v_variant_id IS NOT NULL THEN
            SELECT stock_quantity, name INTO v_current_stock, v_item_title
            FROM product_variants
            WHERE id = v_variant_id
            FOR UPDATE;

            IF v_current_stock IS NULL THEN
                RAISE EXCEPTION 'Product variant not found: %', v_variant_id;
            END IF;

            IF v_current_stock < v_qty THEN
                RAISE EXCEPTION 'Insufficient stock for "%". Only % remaining.', v_item_title, v_current_stock;
            END IF;
        END IF;
    END LOOP;

    -- 2. Deduct inventory
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_variant_id := (v_item->>'variant_id')::UUID;
        v_qty := (v_item->>'quantity')::INT;

        IF v_variant_id IS NOT NULL THEN
            UPDATE product_variants
            SET stock_quantity = stock_quantity - v_qty
            WHERE id = v_variant_id;
        END IF;
    END LOOP;

    -- 3. Insert order
    INSERT INTO orders (
        order_number, user_id, email, phone, shipping_address,
        billing_address, subtotal, shipping_fee, total,
        payment_method, payment_status, status, payment_details
    ) VALUES (
        p_order_data->>'order_number',
        (p_order_data->>'user_id')::UUID,
        p_order_data->>'email',
        p_order_data->>'phone',
        p_order_data->'shipping_address',
        p_order_data->'billing_address',
        (p_order_data->>'subtotal')::NUMERIC,
        COALESCE((p_order_data->>'shipping_fee')::NUMERIC, 0),
        (p_order_data->>'total')::NUMERIC,
        p_order_data->>'payment_method',
        COALESCE((p_order_data->>'payment_status')::payment_status, 'unpaid'),
        COALESCE((p_order_data->>'status')::order_status, 'pending_verification'),
        COALESCE(p_order_data->'payment_details', '{}'::jsonb)
    ) RETURNING id, secret_token INTO v_order_id, v_secret_token;

    -- 4. Insert order items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        INSERT INTO order_items (
            order_id, product_id, variant_id, product_title,
            variant_name, unit_price, quantity, total_price
        ) VALUES (
            v_order_id,
            (v_item->>'product_id')::UUID,
            (v_item->>'variant_id')::UUID,
            v_item->>'product_title',
            v_item->>'variant_name',
            (v_item->>'unit_price')::NUMERIC,
            (v_item->>'quantity')::INT,
            (v_item->>'total_price')::NUMERIC
        );
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'secret_token', v_secret_token
    );
END;
$$;
