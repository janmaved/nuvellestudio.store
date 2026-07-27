INSERT OR IGNORE INTO categories (name, slug, icon, sort_order) VALUES
  ('Makeup', 'makeup', 'fa-wand-magic-sparkles', 1),
  ('Skincare', 'skincare', 'fa-droplet', 2),
  ('Jewelry', 'jewelry', 'fa-gem', 3),
  ('Fashion Women', 'fashion-women', 'fa-person-dress', 4),
  ('Fashion Men', 'fashion-men', 'fa-shirt', 5),
  ('Fragrance', 'fragrance', 'fa-spray-can-sparkles', 6);

INSERT OR IGNORE INTO settings (key, value) VALUES
  ('store_name', 'DIVA'),
  ('store_tagline', 'Beauty. Fashion. Luxury.'),
  ('currency', 'INR'),
  ('free_shipping_threshold', '999'),
  ('shipping_fee', '49'),
  ('payu_key', ''),
  ('hero_title', 'Where Elegance Meets You'),
  ('hero_subtitle', 'Curated luxury beauty, jewelry & fashion for the modern icon.');

INSERT OR IGNORE INTO products (name, description, category, subcategory, brand, price, compare_price, images, rating, reviews_count, featured, tags, stock) VALUES
  ('Velvet Matte Lipstick - Ruby Rose', 'Long-lasting velvet matte finish lipstick enriched with vitamin E. Non-drying, transfer-proof formula in a stunning ruby shade.', 'makeup', 'lips', 'Diva Beauty', 649, 999, '["https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800","https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800"]', 4.8, 342, 1, 'bestseller,matte,lipstick', 150),
  ('24K Gold Glow Serum', 'Luxurious anti-aging face serum infused with 24K gold flakes and hyaluronic acid for radiant, youthful skin.', 'skincare', 'serum', 'Aurelle', 1899, 2799, '["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800","https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800"]', 4.9, 521, 1, 'luxury,serum,gold', 80),
  ('Diamond Solitaire Necklace', 'Elegant 18K white gold plated solitaire pendant with premium cubic zirconia. Perfect for every occasion.', 'jewelry', 'necklace', 'Luxe Jewels', 2499, 4999, '["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800","https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800"]', 4.7, 198, 1, 'diamond,necklace,gift', 45),
  ('Silk Wrap Midi Dress', 'Flowing premium silk-blend wrap dress in emerald green. Timeless elegance for day to night.', 'fashion-women', 'dresses', 'Maison D', 3299, 5499, '["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800","https://images.unsplash.com/photo-1566174053879-31528523f8 ae?w=800"]', 4.6, 156, 1, 'dress,silk,women', 60),
  ('Tailored Wool Blazer - Navy', 'Sharp, modern-fit blazer crafted from Italian wool. Elevate your wardrobe with timeless sophistication.', 'fashion-men', 'blazers', 'Sartor', 4599, 7999, '["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800","https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800"]', 4.8, 89, 1, 'blazer,men,formal', 40),
  ('Midnight Oud Eau de Parfum', 'Intense, long-lasting unisex fragrance with notes of oud, amber and vanilla. A signature scent of luxury.', 'fragrance', 'perfume', 'Noir', 2999, 4499, '["https://images.unsplash.com/photo-1541643600914-78b084683601?w=800","https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800"]', 4.9, 412, 1, 'perfume,oud,unisex', 100),
  ('HD Liquid Foundation - Natural', 'Buildable, full-coverage liquid foundation with SPF 20. Weightless feel with a natural luminous finish.', 'makeup', 'face', 'Diva Beauty', 899, 1299, '["https://images.unsplash.com/photo-1631730359585-38a4935cbec4?w=800"]', 4.5, 267, 0, 'foundation,face', 120),
  ('Rose Gold Hoop Earrings', 'Chic rose gold plated hoop earrings. Lightweight, hypoallergenic and effortlessly stylish.', 'jewelry', 'earrings', 'Luxe Jewels', 1299, 2199, '["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800"]', 4.7, 143, 0, 'earrings,rosegold', 90),
  ('Cashmere Blend Turtleneck', 'Ultra-soft cashmere blend turtleneck sweater in camel. Luxurious warmth with a refined silhouette.', 'fashion-women', 'tops', 'Maison D', 2799, 4299, '["https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800"]', 4.6, 78, 0, 'sweater,cashmere', 55),
  ('Leather Chelsea Boots', 'Premium genuine leather Chelsea boots for men. Classic design with all-day comfort.', 'fashion-men', 'shoes', 'Sartor', 5299, 8499, '["https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800"]', 4.8, 112, 0, 'boots,leather,men', 35),
  ('Hydrating Rose Face Mist', 'Refreshing rose water facial mist that hydrates and sets makeup. Pure botanical extract.', 'skincare', 'mist', 'Aurelle', 549, 799, '["https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800"]', 4.4, 201, 0, 'mist,rose,skincare', 200),
  ('Statement Pearl Bracelet', 'Elegant freshwater pearl bracelet with gold accents. A sophisticated addition to any look.', 'jewelry', 'bracelet', 'Luxe Jewels', 1799, 2999, '["https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800"]', 4.7, 67, 0, 'pearl,bracelet', 70);

INSERT OR IGNORE INTO reviews (product_id, customer_name, rating, comment) VALUES
  (1, 'Priya S.', 5, 'Absolutely love this lipstick! The color is stunning and lasts all day.'),
  (1, 'Ananya M.', 5, 'Best matte lipstick I have ever used. Highly recommend!'),
  (2, 'Riya K.', 5, 'My skin has never looked better. Worth every rupee.'),
  (3, 'Sneha P.', 4, 'Beautiful necklace, looks very premium. Fast delivery.'),
  (6, 'Arjun T.', 5, 'Amazing fragrance, gets so many compliments!');
