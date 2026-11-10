-- ==============================================================================
-- SEED DATA: APPAREL, JEWELRY & BEAUTY BOUTIQUE (USA RETAIL STANDARD)
-- ==============================================================================

-- 1. Categories (Departments & Subcategories)
INSERT INTO categories (id, name, slug, description, image_url, parent_id) VALUES
-- Departments
('11111111-0000-0000-0000-000000000001', 'Women''s Clothing & Fashion', 'womens-clothing', 'Curated women''s designer apparel, handcrafted ethnic ensembles, contemporary silhouettes, and everyday luxury essentials.', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', NULL),
('22222222-0000-0000-0000-000000000001', 'Men''s Clothing & Fashion', 'mens-clothing', 'Refined menswear collection featuring traditional designer Panjabis, tailored Egyptian cotton shirts, and modern stretch trousers.', 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=800&q=80', NULL),
('33333333-0000-0000-0000-000000000001', 'Jewelry & Accessories', 'jewelry-accessories', 'Exquisite bridal choker sets, 22K gold-plated Kundan necklaces, cubic zirconia chandelier earrings, and statement bangles.', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80', NULL),
('44444444-0000-0000-0000-000000000001', 'Footwear', 'footwear', 'Handcrafted Punjabi juttis, embroidered mojaris with memory foam, evening stiletto heels, and genuine leather dress shoes.', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80', NULL),
('55555555-0000-0000-0000-000000000001', 'Cosmetics & Beauty Products', 'cosmetics-beauty', 'Prestige dermatologist-approved skincare, barrier-restoring serums, high-pigment eyeshadow palettes, and luxury cosmetics.', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80', NULL),
('66666666-0000-0000-0000-000000000001', 'Beauty Salon Services', 'salon-services', 'Professional in-studio spa and esthetic appointments: deluxe botanical pedicures, expert cotton eyebrow threading, and tinting.', 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=800&q=80', NULL),

-- Subcategories under Women's Clothing & Fashion
('11111111-0001-0000-0000-000000000001', 'Three-Piece Suits', 'three-piece-suits', 'Embroidered salwar kameez ensembles, formal tailored 3-piece pant suits, and artisan lawn & georgette sets with matching dupattas.', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', '11111111-0000-0000-0000-000000000001'),
('11111111-0002-0000-0000-000000000001', 'Sarees', 'sarees', 'Heritage handloom Banarasi silks, lightweight georgettes, designer organza drapes, and festive party-wear sarees.', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', '11111111-0000-0000-0000-000000000001'),
('11111111-0003-0000-0000-000000000001', 'Petticoats', 'petticoats', '100% breathable combed cotton underskirts, mermaid silhouette shapewear, and satin slip petticoats tailored for sarees.', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80', '11111111-0000-0000-0000-000000000001'),
('11111111-0004-0000-0000-000000000001', 'Blouses', 'blouses', 'Designer padded saree blouses, handcrafted zardozi crop tops, and contemporary sweetheart-neck silhouettes.', 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=800&q=80', '11111111-0000-0000-0000-000000000001'),
('11111111-0005-0000-0000-000000000001', 'Maxi Dresses', 'maxi-dresses', 'Floor-length bohemian floral maxis, tiered evening gowns, and airy resort dresses designed for effortless elegance.', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80', '11111111-0000-0000-0000-000000000001'),
('11111111-0006-0000-0000-000000000001', 'One-Piece Dresses', 'one-piece-dresses', 'Modern cocktail dresses, wrap midi silhouettes, A-line day dresses, and chic desk-to-dinner one-piece staples.', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80', '11111111-0000-0000-0000-000000000001'),
('11111111-0007-0000-0000-000000000001', 'Leggings', 'leggings', 'Ultra-soft 4-way stretch premium cotton leggings, traditional churidar bottoms, and ankle-length shapewear tights.', 'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=800&q=80', '11111111-0000-0000-0000-000000000001'),

-- Subcategories under Men's Clothing & Fashion
('22222222-0001-0000-0000-000000000001', 'Shirts', 'mens-shirts', 'Non-iron spread collar dress shirts, breathable linen button-downs, and tailored slim-fit casual shirts.', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80', '22222222-0000-0000-0000-000000000001'),
('22222222-0002-0000-0000-000000000001', 'Pants & Trousers', 'pants-trousers', 'Tailored flat-front dress trousers, performance stretch chinos, and versatile modern casual slacks.', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80', '22222222-0000-0000-0000-000000000001'),
('22222222-0003-0000-0000-000000000001', 'Punjabi & Kurtas', 'punjabi-kurtas', 'Traditional South Asian men''s embroidered Panjabi sets, raw silk festival kurtas, and handcrafted celebratory attire.', 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=800&q=80', '22222222-0000-0000-0000-000000000001'),

-- Subcategories under Jewelry & Accessories
('33333333-0001-0000-0000-000000000001', 'Jewelry', 'jewelry', 'Handcrafted Polki Kundan sets, semi-precious gemstone necklaces, bridal jhumkas, and timeless 22K gold-plated jewelry.', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80', '33333333-0000-0000-0000-000000000001'),

-- Subcategories under Footwear
('44444444-0001-0000-0000-000000000001', 'Shoes', 'shoes', 'Embroidered genuine leather juttis, cushioned evening block heels, bridal slip-ons, and polished menswear dress shoes.', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80', '44444444-0000-0000-0000-000000000001'),

-- Subcategories under Cosmetics & Beauty Products
('55555555-0001-0000-0000-000000000001', 'Cosmetics', 'cosmetics', 'Advanced peptide serums, brightening botanical elixirs, antioxidant day creams, and barrier-repair skincare solutions.', 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80', '55555555-0000-0000-0000-000000000001'),
('55555555-0002-0000-0000-000000000001', 'Makeup Products', 'makeup-products', 'Velvet matte lip colors, 18-shade warm gilded eyeshadow palettes, waterproof liquid liners, and airbrush setting powders.', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80', '55555555-0000-0000-0000-000000000001'),

-- Subcategories under Beauty Salon Services
('66666666-0001-0000-0000-000000000001', 'Pedicure', 'pedicure', 'Deluxe organic botanical spa pedicures, exfoliating dead sea salt scrubs, intensive heel therapy, and chip-free gel polish.', 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=800&q=80', '66666666-0000-0000-0000-000000000001'),
('66666666-0002-0000-0000-000000000001', 'Eyebrow Grooming & Shaping', 'eyebrow-grooming', 'Master organic cotton threading, brow micro-trimming, botanical tinting, and customized symmetrical arch mapping.', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80', '66666666-0000-0000-0000-000000000001')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  parent_id = EXCLUDED.parent_id;

-- 2. Products
INSERT INTO products (id, title, slug, description, brand, price, compare_at_price, category_id, images, is_active, is_featured, attributes) VALUES
(
    'a1111111-0001-0000-0000-000000000001',
    'Artisan Embroidered Chanderi Silk Three-Piece Salwar Suit',
    'artisan-embroidered-chanderi-silk-three-piece-suit',
    'Exquisitely crafted 3-piece designer suit ensemble featuring a fine Chanderi silk kurta with delicate gold Zari resham neck embroidery, matching tailored straight trousers, and an airy digital-printed floral organza dupatta with scalloped borders.',
    'Zelda Couture',
    89.99,
    185.00,
    '11111111-0001-0000-0000-000000000001',
    ARRAY['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80'],
    TRUE,
    TRUE,
    '{"fabric": "Pure Chanderi Silk & Shantoon Lining", "includes": "Kurti, Trousers & Organza Dupatta", "occasion": "Festive & Formal Occasion", "care_instructions": "Dry Clean Only", "style": "Straight Cut Suit Set"}'::jsonb
),
(
    'a1111111-0002-0000-0000-000000000001',
    'Heritage Banarasi Katan Silk Woven Saree with Blouse Piece',
    'heritage-banarasi-katan-silk-woven-saree',
    'Magnificent bridal-grade Banarasi Katan silk saree handwoven with intricate antique gold zari floral motifs across the body, a rich ornamental pallu, and an unstitched coordinating raw silk blouse fabric.',
    'Varanasi Weavers',
    129.99,
    280.00,
    '11111111-0002-0000-0000-000000000001',
    ARRAY['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80'],
    TRUE,
    TRUE,
    '{"fabric": "Pure Katan Silk with Metallic Zari", "dimensions": "5.5m Saree + 0.8m Blouse Fabric", "occasion": "Bridal, Reception & Celebrations", "care_instructions": "Professional Dry Clean"}'::jsonb
),
(
    'a1111111-0003-0000-0000-000000000001',
    'Tailored 100% Breathable Combed Cotton Saree Petticoat',
    'tailored-combed-cotton-saree-petticoat',
    'Comfortable, non-clingy underskirt crafted from 100% premium long-staple combed cotton with 6-panel A-line tailoring, heavy-duty adjustable drawstring waistband, and reinforced bottom hem.',
    'Zelda Essentials',
    19.99,
    38.00,
    '11111111-0003-0000-0000-000000000001',
    ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80'],
    TRUE,
    FALSE,
    '{"material": "100% Combed Mercerized Cotton", "fit": "6-Panel Flared A-Line Silhouette", "dimensions": "38 in Length", "care_instructions": "Machine Wash Warm"}'::jsonb
),
(
    'a1111111-0004-0000-0000-000000000001',
    'Handcrafted Zardozi Embroidered Raw Silk Saree Blouse',
    'handcrafted-zardozi-embroidered-raw-silk-blouse',
    'Designer readymade saree blouse in rich raw silk featuring intricate gold dabka and zardozi needlework along the sweetheart neckline and elbow sleeves. Pre-padded with interior seam margins for custom tailoring adjustments.',
    'Zelda Couture',
    44.99,
    95.00,
    '11111111-0004-0000-0000-000000000001',
    ARRAY['https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=1000&q=80'],
    TRUE,
    TRUE,
    '{"fabric": "Raw Silk with Pure Cotton Lining", "style": "Sweetheart Neck with Latkan Dori Tie", "care_instructions": "Dry Clean Only"}'::jsonb
),
(
    'a1111111-0005-0000-0000-000000000001',
    'Boho-Luxe Floral Tiered Georgette Maxi Dress',
    'boho-luxe-floral-tiered-georgette-maxi-dress',
    'Sweeping floor-length maxi dress designed in airy botanical printed georgette chiffon. Features a flattering V-neckline, smocked elastic waist for effortless fit, and breezy tiered ruffle hemline with full interior lining.',
    'Aura Studio NYC',
    54.99,
    120.00,
    '11111111-0005-0000-0000-000000000001',
    ARRAY['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=80'],
    TRUE,
    TRUE,
    '{"fabric": "Lightweight Poly-Georgette with Soft Crepe Lining", "style": "Tiered A-Line Silhouette", "dimensions": "56 in Full Length", "care_instructions": "Machine Wash Gentle / Hang Dry"}'::jsonb
),
(
    'a1111111-0006-0000-0000-000000000001',
    'Tailored Sculpt Crepe Wrap Midi Day-to-Dinner Dress',
    'tailored-sculpt-crepe-wrap-midi-dress',
    'Impeccably tailored midi one-piece dress with self-tie belt and subtle cap sleeves. Modern stretch-crepe fabric holds its crisp shape from morning business meetings to evening galas.',
    'Madison & Fifth',
    48.99,
    110.00,
    '11111111-0006-0000-0000-000000000001',
    ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80'],
    TRUE,
    FALSE,
    '{"material": "92% Poly, 8% Elastane Stretch Crepe", "style": "Surplice Wrap Midi Silhouette", "care_instructions": "Machine Wash Cold / Low Iron"}'::jsonb
),
(
    'a1111111-0007-0000-0000-000000000001',
    'Ultra-Soft 4-Way Stretch Cotton Churidar Leggings (2-Pack)',
    'ultra-soft-4-way-stretch-cotton-churidar-leggings-2-pack',
    'Two-pack of ultra-soft 4-way stretch combed cotton leggings featuring gatherable ankle pleats (churidar gathers) and a non-rolling covered elastic waistband. Fully opaque with breathable comfort.',
    'Zelda Essentials',
    24.99,
    50.00,
    '11111111-0007-0000-0000-000000000001',
    ARRAY['https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=1000&q=80'],
    TRUE,
    FALSE,
    '{"material": "95% Combed Cotton, 5% Spandex (220 GSM)", "fit": "High-Rise Elastic Comfort Band", "care_instructions": "Machine Wash Cold / Tumble Dry Low"}'::jsonb
),
(
    'a2222222-0001-0000-0000-000000000001',
    'Tailored Slim-Fit Non-Iron Two-Ply Egyptian Cotton Dress Shirt',
    'tailored-slim-fit-non-iron-dress-shirt',
    'Crisp, wrinkle-resistant dress shirt woven from 100% two-ply Egyptian long-staple cotton with a semi-spread collar, convertible French/barrel cuffs, and reinforced mother-of-pearl buttons.',
    'Kensington & Co.',
    39.99,
    85.00,
    '22222222-0001-0000-0000-000000000001',
    ARRAY['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80'],
    TRUE,
    TRUE,
    '{"material": "100% Two-Ply Compact Egyptian Cotton", "fit": "Tailored Modern Slim Fit", "collar": "Semi-Spread Collar with Removable Stays", "care_instructions": "Machine Wash Warm / Wrinkle-Free Non-Iron"}'::jsonb
),
(
    'a2222222-0002-0000-0000-000000000001',
    'Modern Flat-Front Performance Stretch Wool-Blend Dress Trousers',
    'modern-flat-front-stretch-dress-trousers',
    'Sleek flat-front menswear trousers engineered with four-way mechanical stretch, hidden flex-waistband, shirt-gripper interior band, and wrinkle-recovery fabric for all-day sharpness.',
    'Kensington & Co.',
    44.99,
    98.00,
    '22222222-0002-0000-0000-000000000001',
    ARRAY['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80'],
    TRUE,
    FALSE,
    '{"material": "68% Poly, 28% Rayon, 4% Spandex", "fit": "Flat-Front Tailored Tapered Leg", "care_instructions": "Machine Wash Cold / Tumble Low"}'::jsonb
),
(
    'a2222222-0003-0000-0000-000000000001',
    'Hand-Embroidered Jacquard Silk Festival Panjabi with Pajama Set',
    'hand-embroidered-jacquard-silk-festival-panjabi-set',
    'Traditional men''s celebration Panjabi kurta set tailored in lustrous self-woven silk jacquard. Features subtle thread and sequin embroidery along the mandarin bandhgala collar and placket, accompanied by matching white churidar cotton trousers.',
    'Nawab Heritage',
    79.99,
    165.00,
    '22222222-0003-0000-0000-000000000001',
    ARRAY['https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=1000&q=80'],
    TRUE,
    TRUE,
    '{"fabric": "Fine Jacquard Art Silk Kurta & Cotton Pajama", "includes": "Embroidered Panjabi Kurta & Churidar Pajama", "occasion": "Eid, Weddings, Puja & Cultural Festivals", "care_instructions": "Dry Clean Recommended"}'::jsonb
),
(
    'a3333333-0001-0000-0000-000000000001',
    'Handcrafted 22K Gold-Plated Kundan & Pearl Bridal Choker Set',
    'handcrafted-22k-gold-plated-kundan-pearl-bridal-choker-set',
    'Stunning royal heirloom necklace set encrusted with hydro polki Kundan stones, clustered freshwater seed pearls, and emerald teardrop beads. Includes grand choker necklace, matching statement jhumka earrings, and a delicate maang tikka.',
    'Zelda High Jewelry',
    69.99,
    160.00,
    '33333333-0001-0000-0000-000000000001',
    ARRAY['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80'],
    TRUE,
    TRUE,
    '{"material": "22K Micron Gold-Plated Brass Alloy", "stones": "Polki Kundan & Cultured Seed Pearls", "includes": "Choker Necklace, Jhumka Earrings & Maang Tikka", "fragile": true}'::jsonb
),
(
    'a4444444-0001-0000-0000-000000000001',
    'Embroidered Velvet Zari Mojari Bridal Juttis with Memory Foam',
    'embroidered-velvet-zari-mojari-bridal-juttis',
    'Artisanal Punjabi juttis crafted in plush midnight black velvet, hand-embroidered with micro zardozi beads and metallic dabka wire. Engineered with a triple-layered memory foam insole and supple vegetable-tanned genuine leather sole for all-day comfort without bites.',
    'Amritsar Leather Works',
    34.99,
    75.00,
    '44444444-0001-0000-0000-000000000001',
    ARRAY['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1000&q=80'],
    TRUE,
    TRUE,
    '{"material": "Embroidered Velvet Upper & Buff Leather Sole", "insole": "High-Density Memory Foam Cushioning", "style": "Traditional Round-Toe Mojari Flat", "care_instructions": "Wipe with Dry Cloth / Keep in Dustbag"}'::jsonb
),
(
    'a5555555-0001-0000-0000-000000000001',
    'Hydra-Barrier 5-Peptide Restorative Infusion Serum (50ml)',
    'hydra-barrier-5-peptide-restorative-infusion-serum',
    'Clinical-strength facial treatment serum formulated with 5 biomimetic peptides, multi-molecular hyaluronic acid, niacinamide, and ceramide NP to immediately plump fine lines, restore damaged skin barriers, and deliver 48-hour dewy hydration.',
    'Aura Botanica Paris',
    26.99,
    68.00,
    '55555555-0001-0000-0000-000000000001',
    ARRAY['https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1000&q=80'],
    TRUE,
    TRUE,
    '{"volume": "50ml / 1.7 fl oz", "skin_type": "All Skin Types, Dehydrated & Sensitive Safe", "key_actives": "Peptides, Hyaluronic Acid, Ceramides & Squalane", "fragile": true}'::jsonb
),
(
    'a5555555-0002-0000-0000-000000000001',
    'Gilded Rose 18-Shade Velvet Matte & Foil Shimmer Eyeshadow Palette',
    'gilded-rose-18-shade-eyeshadow-palette',
    'Prestige 18-pan eyeshadow palette loaded with velvety warm terracotta mattes, molten champagne foils, duo-chromatic bronzes, and deep berry satins. High-payoff pigment formulation that blends seamlessly with zero creasing.',
    'Luxe Glamour Cosmetics',
    28.99,
    62.00,
    '55555555-0002-0000-0000-000000000001',
    ARRAY['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80'],
    TRUE,
    TRUE,
    '{"shade": "18 Gilded Rose & Earth Tone Shades", "finish": "Velvet Matte, Duo-Chrome & High-Foil Metallic", "fragile": true}'::jsonb
),
(
    'a6666666-0001-0000-0000-000000000001',
    'Deluxe Botanical Spa Pedicure & Callus Smoothing Treatment (60 Min)',
    'deluxe-botanical-spa-pedicure-treatment',
    'Luxurious 60-minute in-studio spa pedicure experience. Includes warm dead sea salt mineral foot soak, AHA fruit enzyme exfoliating scrub, volcanic callus smoothing, heated towel wrap, tension-relieving acupressure foot massage, and long-lasting salon polish finish.',
    'Zelda Beauty Studio',
    45.00,
    75.00,
    '66666666-0001-0000-0000-000000000001',
    ARRAY['https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=1000&q=80'],
    TRUE,
    TRUE,
    '{"duration": "60 Minutes", "service_type": "In-Studio Spa Pedicure Service", "appointment_required": true, "includes": "Mineral Soak, AHA Scrub, Callus Therapy, Massage & Polish"}'::jsonb
),
(
    'a6666666-0002-0000-0000-000000000001',
    'Master Organic Cotton Brow Threading & Symmetrical Arch Shaping',
    'master-organic-cotton-brow-threading-arch-shaping',
    'Precision eyebrow grooming performed by licensed master estheticians using 100% antibacterial organic combed cotton thread. Includes facial proportion mapping, gentle hair removal, micro-trimming, and a cooling aloe vera herbal soothing massage.',
    'Zelda Beauty Studio',
    14.99,
    25.00,
    '66666666-0002-0000-0000-000000000001',
    ARRAY['https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80'],
    TRUE,
    TRUE,
    '{"duration": "15-20 Minutes", "service_type": "Brow Grooming & Shaping Service", "appointment_required": false, "includes": "Thread Shaping, Micro-Trim & Calming Aloe Massage"}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  compare_at_price = EXCLUDED.compare_at_price,
  category_id = EXCLUDED.category_id,
  images = EXCLUDED.images,
  attributes = EXCLUDED.attributes;

-- 3. Product Variants & Stock
INSERT INTO product_variants (id, product_id, sku, name, price, compare_at_price, stock_quantity, attributes) VALUES
('b1111111-0001-0000-0000-000000000001', 'a1111111-0001-0000-0000-000000000001', 'SUIT-CHAND-S', 'Small (Bust 36 in)', 89.99, 185.00, 8, '{"size": "S", "bust": "36 in"}'::jsonb),
('b1111111-0001-0000-0000-000000000002', 'a1111111-0001-0000-0000-000000000001', 'SUIT-CHAND-M', 'Medium (Bust 38 in)', 89.99, 185.00, 12, '{"size": "M", "bust": "38 in"}'::jsonb),
('b1111111-0001-0000-0000-000000000003', 'a1111111-0001-0000-0000-000000000001', 'SUIT-CHAND-L', 'Large (Bust 40 in)', 89.99, 185.00, 6, '{"size": "L", "bust": "40 in"}'::jsonb),

('b1111111-0002-0000-0000-000000000001', 'a1111111-0002-0000-0000-000000000001', 'SAREE-KATAN-CRIMSON', 'Royal Crimson Red', 129.99, 280.00, 5, '{"color": "Crimson Red"}'::jsonb),
('b1111111-0002-0000-0000-000000000002', 'a1111111-0002-0000-0000-000000000001', 'SAREE-KATAN-EMERALD', 'Deep Emerald Green', 129.99, 280.00, 4, '{"color": "Emerald Green"}'::jsonb),

('b1111111-0003-0000-0000-000000000001', 'a1111111-0003-0000-0000-000000000001', 'PET-COT-M-GOLD', 'Medium (Waist 28-34 in) - Golden Beige', 19.99, 38.00, 20, '{"size": "Medium", "color": "Golden Beige"}'::jsonb),
('b1111111-0003-0000-0000-000000000002', 'a1111111-0003-0000-0000-000000000001', 'PET-COT-L-RED', 'Large (Waist 34-40 in) - Classic Crimson', 19.99, 38.00, 18, '{"size": "Large", "color": "Crimson"}'::jsonb),

('b1111111-0004-0000-0000-000000000001', 'a1111111-0004-0000-0000-000000000001', 'BLOUSE-ZARD-36', 'Size 36 (Bust 36 in)', 44.99, 95.00, 7, '{"size": "36"}'::jsonb),
('b1111111-0004-0000-0000-000000000002', 'a1111111-0004-0000-0000-000000000001', 'BLOUSE-ZARD-38', 'Size 38 (Bust 38 in)', 44.99, 95.00, 9, '{"size": "38"}'::jsonb),

('b1111111-0005-0000-0000-000000000001', 'a1111111-0005-0000-0000-000000000001', 'MAXI-FLOR-S', 'Small (US 4-6)', 54.99, 120.00, 11, '{"size": "S"}'::jsonb),
('b1111111-0005-0000-0000-000000000002', 'a1111111-0005-0000-0000-000000000001', 'MAXI-FLOR-M', 'Medium (US 8-10)', 54.99, 120.00, 14, '{"size": "M"}'::jsonb),

('b1111111-0006-0000-0000-000000000001', 'a1111111-0006-0000-0000-000000000001', 'WRAP-MIDI-M-NAVY', 'Medium (US 8) - Midnight Navy', 48.99, 110.00, 10, '{"size": "M", "color": "Midnight Navy"}'::jsonb),

('b1111111-0007-0000-0000-000000000001', 'a1111111-0007-0000-0000-000000000001', 'LEG-CHUR-M-BW', 'Medium - Jet Black & Ivory White', 24.99, 50.00, 25, '{"size": "Medium", "pack": "Black & Ivory"}'::jsonb),
('b1111111-0007-0000-0000-000000000002', 'a1111111-0007-0000-0000-000000000001', 'LEG-CHUR-L-BW', 'Large - Jet Black & Ivory White', 24.99, 50.00, 22, '{"size": "Large", "pack": "Black & Ivory"}'::jsonb),

('b2222222-0001-0000-0000-000000000001', 'a2222222-0001-0000-0000-000000000001', 'SHIRT-OXF-155-WHT', 'Neck 15.5 in / Sleeve 33 in - Optical White', 39.99, 85.00, 12, '{"size": "15.5 / 33", "color": "White"}'::jsonb),
('b2222222-0001-0000-0000-000000000002', 'a2222222-0001-0000-0000-000000000001', 'SHIRT-OXF-160-BLU', 'Neck 16.0 in / Sleeve 34 in - French Sky Blue', 39.99, 85.00, 14, '{"size": "16.0 / 34", "color": "Sky Blue"}'::jsonb),

('b2222222-0002-0000-0000-000000000001', 'a2222222-0002-0000-0000-000000000001', 'TROUS-3230-CHAR', '32W x 30L - Charcoal Heather', 44.99, 98.00, 8, '{"size": "32x30", "color": "Charcoal"}'::jsonb),
('b2222222-0002-0000-0000-000000000002', 'a2222222-0002-0000-0000-000000000001', 'TROUS-3432-NAVY', '34W x 32L - Classic Navy', 44.99, 98.00, 11, '{"size": "34x32", "color": "Navy"}'::jsonb),

('b2222222-0003-0000-0000-000000000001', 'a2222222-0003-0000-0000-000000000001', 'PUNJ-JACQ-40', 'Size 40 (Chest 40 in) - Golden Sand', 79.99, 165.00, 7, '{"size": "40"}'::jsonb),
('b2222222-0003-0000-0000-000000000002', 'a2222222-0003-0000-0000-000000000001', 'PUNJ-JACQ-42', 'Size 42 (Chest 42 in) - Wine Maroon', 79.99, 165.00, 9, '{"size": "42"}'::jsonb),

('b3333333-0001-0000-0000-000000000001', 'a3333333-0001-0000-0000-000000000001', 'JEWEL-KUND-EMR', 'Emerald Green Drops', 69.99, 160.00, 6, '{"stone_color": "Emerald Green"}'::jsonb),
('b3333333-0001-0000-0000-000000000002', 'a3333333-0001-0000-0000-000000000001', 'JEWEL-KUND-RUBY', 'Royal Ruby Crimson Drops', 69.99, 160.00, 5, '{"stone_color": "Ruby Crimson"}'::jsonb),

('b4444444-0001-0000-0000-000000000001', 'a4444444-0001-0000-0000-000000000001', 'JUTTI-VELV-US7', 'US Women 7 / EU 38', 34.99, 75.00, 8, '{"size": "US 7"}'::jsonb),
('b4444444-0001-0000-0000-000000000002', 'a4444444-0001-0000-0000-000000000001', 'JUTTI-VELV-US8', 'US Women 8 / EU 39', 34.99, 75.00, 10, '{"size": "US 8"}'::jsonb),

('b5555555-0001-0000-0000-000000000001', 'a5555555-0001-0000-0000-000000000001', 'SERUM-HYDRA-50', '50ml Standard Frosted Dropper Bottle', 26.99, 68.00, 18, '{"volume": "50ml"}'::jsonb),

('b5555555-0002-0000-0000-000000000001', 'a5555555-0002-0000-0000-000000000001', 'PAL-GLD-ROSE', '18-Pan Mirrored Luxury Compact', 28.99, 62.00, 15, '{"packaging": "Mirrored Magnetic Compact"}'::jsonb),

('b6666666-0001-0000-0000-000000000001', 'a6666666-0001-0000-0000-000000000001', 'SRV-PEDI-60MIN', 'Single 60-Minute Deluxe Pedicure Session', 45.00, 75.00, 50, '{"duration": "60 min"}'::jsonb),

('b6666666-0002-0000-0000-000000000001', 'a6666666-0002-0000-0000-000000000001', 'SRV-BROW-THREAD', 'Classic Threading & Arch Sculpting', 14.99, 25.00, 100, '{"service": "Threading Only"}'::jsonb)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  compare_at_price = EXCLUDED.compare_at_price,
  stock_quantity = EXCLUDED.stock_quantity,
  attributes = EXCLUDED.attributes;
