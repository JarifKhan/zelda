-- ==============================================================================
-- SEED DATA: BEAUTY & HOME ACCESSORIES (TJ MAXX / BURLINGTON STYLE)
-- ==============================================================================

-- Categories
INSERT INTO categories (id, name, slug, description, image_url) VALUES
('11111111-1111-1111-1111-111111111111', 'Beauty & Fragrance', 'beauty', 'Designer fragrances, skincare, hair treatments, and cosmetic finds.', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80'),
('22222222-2222-2222-2222-222222222222', 'Home Accents & Decor', 'home-decor', 'Curated vases, candles, artisanal ceramics, and cozy accent essentials.', 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80'),
('33333333-3333-3333-3333-333333333333', 'Kitchen & Entertaining', 'kitchen', 'Marble boards, glassware, artisanal serveware, and cookware finds.', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80'),
('44444444-4444-4444-4444-444444444444', 'Bath & Wellness', 'bath-wellness', 'Plush Turkish towels, spa bathrobes, aromatherapy oils, and vanity organizers.', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (slug) DO NOTHING;

-- Products
INSERT INTO products (id, title, slug, description, brand, price, compare_at_price, category_id, images, is_active, is_featured, attributes) VALUES
(
    'a1111111-1111-1111-1111-111111111111',
    'Amber & Santal Botanical Soy Candle (14 oz)',
    'amber-santal-botanical-soy-candle',
    'Hand-poured 100% natural soy wax candle infused with smoked amber, crushed cedarwood, and Australian sandalwood. Double cotton wick for a clean 75-hour burn in a reusable frosted glass vessel.',
    'Maison Luminaire',
    18.99,
    42.00,
    '22222222-2222-2222-2222-222222222222',
    ARRAY['https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1000&q=80'],
    TRUE,
    TRUE,
    '{"scent": "Smoked Amber & Sandalwood", "burn_time": "75 hrs", "material": "Soy Wax & Glass", "fragile": true, "dimensions": "4 x 4.5 in"}'::jsonb
),
(
    'a2222222-2222-2222-2222-222222222222',
    'Hydra-Barrier Peptide Restorative Serum (50ml)',
    'hydra-barrier-peptide-serum',
    'Concentrated facial serum formulated with 5 biomimetic peptides, multi-molecular hyaluronic acid, and ceramide complex to restore moisture barrier and plump fine lines.',
    'Aura Botanica Paris',
    24.99,
    68.00,
    '11111111-1111-1111-1111-111111111111',
    ARRAY['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=80'],
    TRUE,
    TRUE,
    '{"volume": "50ml / 1.7 fl oz", "skin_type": "All Skin Types, Dehydrated", "key_actives": "Peptides, Hyaluronic Acid, Ceramides", "fragile": true}'::jsonb
),
(
    'a3333333-3333-3333-3333-333333333333',
    'Handcrafted Fluted Ceramic Bud Vase',
    'handcrafted-fluted-ceramic-vase',
    'Artisanal stoneware vase featuring matte ribbed exterior texturing and an organic glazed lip. Ideal for dried botanical stems or fresh wildflower arrangements.',
    'Studio Terrene',
    14.99,
    34.00,
    '22222222-2222-2222-2222-222222222222',
    ARRAY['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80'],
    TRUE,
    TRUE,
    '{"color": "Oatmeal Matte", "material": "Stoneware Ceramic", "dimensions": "7.5 H x 3.8 W in", "fragile": true, "room": "Living Room, Entryway"}'::jsonb
),
(
    'a4444444-4444-4444-4444-444444444444',
    'Rosewater & Wild Peony Eau de Parfum (100ml)',
    'rosewater-wild-peony-perfume',
    'Fresh floral scent layered with dewy Bulgarian rose petals, pink peony, sparkling Italian bergamot, and white musk base.',
    'Fleur & Brume',
    29.99,
    85.00,
    '11111111-1111-1111-1111-111111111111',
    ARRAY['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80'],
    TRUE,
    TRUE,
    '{"scent_family": "Fresh Floral", "volume": "100ml / 3.4 fl oz", "fragile": true}'::jsonb
),
(
    'a5555555-5555-5555-5555-555555555555',
    'Acacia & White Marble Round Serving Board',
    'acacia-marble-round-serving-board',
    'Natural dual-material charcuterie and serving board combining solid acacia hardwood with cool polished white Morwad marble. Features brass-riveted hanging loop.',
    'Artisan Hearth',
    22.99,
    55.00,
    '33333333-3333-3333-3333-333333333333',
    ARRAY['https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=1000&q=80'],
    TRUE,
    FALSE,
    '{"dimensions": "12 in Diameter x 0.6 in H", "material": "Natural Acacia & Marble", "care": "Hand wash only"}'::jsonb
),
(
    'a6666666-6666-6666-6666-666666666666',
    'Organic Turkish Cotton Waffle Bath Sheet',
    'organic-turkish-cotton-waffle-bath-sheet',
    'Oversized 600 GSM bath sheet woven from 100% GOTS-certified Aegean long-staple cotton in a honey-comb deep waffle texture that dries rapidly.',
    'Haven Home Textiles',
    21.99,
    48.00,
    '44444444-4444-4444-4444-444444444444',
    ARRAY['https://images.unsplash.com/photo-1616627547584-bf28cee262db?auto=format&fit=crop&w=1000&q=80'],
    TRUE,
    FALSE,
    '{"dimensions": "40 x 70 in", "material": "100% Organic Cotton", "care": "Machine wash warm"}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- Product Variants & Inventory
INSERT INTO product_variants (id, product_id, sku, name, price, compare_at_price, stock_quantity, attributes) VALUES
-- Candle variants
('b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'CANDLE-AMBER-14', '14 oz Double Wick', 18.99, 42.00, 15, '{"size": "14 oz", "scent": "Amber & Santal"}'::jsonb),
('b1111111-1111-1111-1111-111111111112', 'a1111111-1111-1111-1111-111111111111', 'CANDLE-AMBER-22', '22 oz Triple Wick', 26.99, 58.00, 8, '{"size": "22 oz", "scent": "Amber & Santal"}'::jsonb),

-- Serum variants
('b2222222-2222-2222-2222-222222222221', 'a2222222-2222-2222-2222-222222222222', 'SERUM-PEP-50ML', '50ml Standard', 24.99, 68.00, 20, '{"volume": "50ml"}'::jsonb),
('b2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'SERUM-PEP-100ML', '100ml Value Size', 39.99, 110.00, 6, '{"volume": "100ml"}'::jsonb),

-- Vase variants
('b3333333-3333-3333-3333-333333333331', 'a3333333-3333-3333-3333-333333333333', 'VASE-FLUTED-OAT', 'Oatmeal Matte', 14.99, 34.00, 12, '{"color": "Oatmeal"}'::jsonb),
('b3333333-3333-3333-3333-333333333332', 'a3333333-3333-3333-3333-333333333333', 'VASE-FLUTED-TERRA', 'Terracotta Wash', 14.99, 34.00, 9, '{"color": "Terracotta"}'::jsonb),

-- Perfume variants
('b4444444-4444-4444-4444-444444444441', 'a4444444-4444-4444-4444-444444444444', 'PERF-ROSE-100ML', '100ml Full Size', 29.99, 85.00, 18, '{"volume": "100ml"}'::jsonb),

-- Serving Board
('b5555555-5555-5555-5555-555555555551', 'a5555555-5555-5555-5555-555555555555', 'BOARD-MARBLE-12', '12 inch Round', 22.99, 55.00, 14, '{"diameter": "12 in"}'::jsonb),

-- Turkish Towel
('b6666666-6666-6666-6666-666666666661', 'a6666666-6666-6666-6666-666666666666', 'TOWEL-WAFFLE-SAGE', 'Sage Green', 21.99, 48.00, 25, '{"color": "Sage Green"}'::jsonb),
('b6666666-6666-6666-6666-666666666662', 'a6666666-6666-6666-6666-666666666666', 'TOWEL-WAFFLE-LINEN', 'Natural Linen', 21.99, 48.00, 30, '{"color": "Natural Linen"}'::jsonb)
ON CONFLICT (sku) DO NOTHING;
