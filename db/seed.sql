-- AffiliBlog — seed data (re-runnable; ON CONFLICT DO NOTHING).
-- Run after 0001_init.sql. Image URLs are Unsplash placeholders (allowed in
-- next.config.ts for dev) — replace with owned images before launch.

-- categories -----------------------------------------------------------------
INSERT INTO categories (slug, name, image_url) VALUES
  ('electronics',    'Electronics',     'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=500&h=500&q=80'),
  ('home-kitchen',   'Home & Kitchen',   'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=500&h=500&q=80'),
  ('fashion',        'Fashion',          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&h=500&q=80'),
  ('health-fitness', 'Health & Fitness', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=500&h=500&q=80'),
  ('beauty',         'Beauty',           'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=500&h=500&q=80'),
  ('deals',          'Deals & Offers',   'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=500&h=500&q=80')
ON CONFLICT (slug) DO NOTHING;

-- products (one row per Amazon listing; reused across posts via post_products) -
INSERT INTO products (name, image_url, amazon_url, price_inr, mrp_inr, rating, review_count, pros, why_picked, updated_at) VALUES
  ('boAt Rockerz 450 Pro',
   'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&h=600&q=80',
   'https://www.amazon.in/dp/B0EXAMPLE1?tag=affiliblog-21',
   249900, 499000, 4.5, 12345,
   '["Excellent sound with deep bass","Up to 70H battery life","Comfortable for long use","Dual pairing & Bluetooth 5.3"]',
   'The best overall performance with premium features at an affordable price. Great sound, long battery life and very comfortable.',
   NOW()),
  ('Sony WH-CH520',
   'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=600&h=600&q=80',
   'https://www.amazon.in/dp/B0EXAMPLE2?tag=affiliblog-21',
   399000, 549000, 4.4, 8921,
   '["Class-leading 50H playback","Sony DSEE audio upscaling","Multipoint connection","Feather-light at 147g"]',
   'If battery life matters most, this lasts weeks between charges and still sounds balanced across genres.',
   NOW()),
  ('JBL Tune 510BT',
   'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&h=600&q=80',
   'https://www.amazon.in/dp/B0EXAMPLE3?tag=affiliblog-21',
   299900, 449900, 4.3, 6410,
   '["Signature JBL Pure Bass","40H battery, fast charge","Foldable travel design","Speed charge: 5 min = 2H"]',
   'The safest budget pick — reliable build, punchy bass and quick charging for commuters.',
   NOW())
ON CONFLICT (amazon_url) DO NOTHING;

-- post 1: headphones (Electronics, hero + trending) -------------------------
INSERT INTO posts
  (slug, title, excerpt, category_id, author_name, author_avatar, published_at,
   hero_image_url, read_time_minutes, body, table_of_contents, in_this_article,
   pull_quote, faqs, is_published, is_hero, is_trending, updated_at)
VALUES
  ('best-wireless-headphones-under-5000',
   'Best Wireless Headphones Under ₹5,000 in 2025',
   'We tested 20+ headphones to find the best ones that deliver great sound, comfort and battery life.',
   (SELECT id FROM categories WHERE slug = 'electronics'),
   'Rohan Mehta',
   'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&h=100&q=80',
   '2025-05-20T14:30:00Z',
   'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1400&h=1000&q=80',
   6,
   $body1$
   <p>Finding the right wireless headphones under ₹5,000 can feel like guesswork. With so many models and identical spec sheets, it is hard to know which ones are actually worth your money.</p>
   <p>We tested 20+ models for sound quality, comfort, battery life and value. After hours of comparing and listening, these are the top 5 we recommend in 2025.</p>
   <section id="detailed-reviews"><h2>Detailed Reviews</h2><p>Each pair was used for at least a week as a daily driver so the notes reflect real use.</p></section>
   <section id="how-we-tested"><h2>How We Tested</h2><p>We scored every model on sound signature, battery life, comfort, build quality and value for money.</p></section>
   <section id="buying-guide"><h2>Buying Guide</h2><p>Prioritise Bluetooth 5.3, 40H+ battery, and memory-foam earcups for long sessions.</p></section>
   <section id="conclusion"><h2>Conclusion</h2><p>The boAt Rockerz 450 Pro remains our overall pick for its blend of battery life, comfort and price.</p></section>
   $body1$,
   '[{"num":"01","label":"Top 5 Best Headphones","id":"top-5"},{"num":"02","label":"Detailed Reviews","id":"detailed-reviews"},{"num":"03","label":"How We Tested","id":"how-we-tested"},{"num":"04","label":"Comparison Table","id":"comparison"},{"num":"05","label":"Buying Guide","id":"buying-guide"},{"num":"06","label":"FAQs","id":"faqs"},{"num":"07","label":"Conclusion","id":"conclusion"}]'::jsonb,
   '["Top 5 Best Headphones","Detailed Pros & Cons","How We Tested","Comparison Table","Buying Guide & FAQs","Conclusion"]'::jsonb,
   'The best pair isn''t the most expensive — it''s the one you''ll actually enjoy using every day.',
   '[{"q":"Are wireless headphones under ₹5,000 good for calls?","a":"Yes — models with dual microphones and ENC handle indoor calls well."},{"q":"Do any of these support active noise cancellation?","a":"At this price ANC is usually passive isolation only. Expect meaningful ANC from around ₹7,000 upward."}]'::jsonb,
   TRUE, TRUE, TRUE, NOW())
ON CONFLICT (slug) DO NOTHING;

-- link post 1 to its 3 products ---------------------------------------------
INSERT INTO post_products (post_id, product_id, display_order, rank_num, badge)
SELECT p.id, pr.id, 1, 1, '#1 Best Overall'
  FROM posts p, products pr
 WHERE p.slug = 'best-wireless-headphones-under-5000'
   AND pr.amazon_url = 'https://www.amazon.in/dp/B0EXAMPLE1?tag=affiliblog-21'
ON CONFLICT (post_id, product_id) DO NOTHING;

INSERT INTO post_products (post_id, product_id, display_order, rank_num, badge)
SELECT p.id, pr.id, 2, 2, '#2 Best Battery'
  FROM posts p, products pr
 WHERE p.slug = 'best-wireless-headphones-under-5000'
   AND pr.amazon_url = 'https://www.amazon.in/dp/B0EXAMPLE2?tag=affiliblog-21'
ON CONFLICT (post_id, product_id) DO NOTHING;

INSERT INTO post_products (post_id, product_id, display_order, rank_num, badge)
SELECT p.id, pr.id, 3, 3, '#3 Best Value'
  FROM posts p, products pr
 WHERE p.slug = 'best-wireless-headphones-under-5000'
   AND pr.amazon_url = 'https://www.amazon.in/dp/B0EXAMPLE3?tag=affiliblog-21'
ON CONFLICT (post_id, product_id) DO NOTHING;

-- post 2: air fryers (Home & Kitchen, trending) -----------------------------
INSERT INTO posts
  (slug, title, excerpt, category_id, author_name, author_avatar, published_at,
   hero_image_url, read_time_minutes, body, table_of_contents, in_this_article,
   is_published, is_hero, is_trending, updated_at)
VALUES
  ('top-7-air-fryers',
   'Top 7 Air Fryers for Healthy Cooking in 2025',
   'Crispy, oil-free and fast — these are the air fryers worth your counter space.',
   (SELECT id FROM categories WHERE slug = 'home-kitchen'),
   'Rohan Mehta',
   'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&h=100&q=80',
   '2025-05-18T10:00:00Z',
   'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=700&h=520&q=80',
   5,
   '<section id="intro"><p>Air fryers have become a kitchen essential. We tested seven models for crispy results, ease of cleaning and value.</p></section><section id="picks"><h2>Our Top Picks</h2><p>From compact 2L units to family-size 6L fryers, here is what we recommend.</p></section>',
   '[{"num":"01","label":"Our Top Picks","id":"picks"}]'::jsonb,
   '["Our Top Picks","What to Look For"]'::jsonb,
   TRUE, FALSE, TRUE, NOW())
ON CONFLICT (slug) DO NOTHING;

-- post 3: laptops (Electronics) ---------------------------------------------
INSERT INTO posts
  (slug, title, excerpt, category_id, author_name, author_avatar, published_at,
   hero_image_url, read_time_minutes, body, table_of_contents, in_this_article,
   is_published, is_hero, is_trending, updated_at)
VALUES
  ('best-laptops-for-students',
   'Best Laptops for Students & Professionals in 2025',
   'Lightweight, long battery life and powerful enough for everything from coding to video calls.',
   (SELECT id FROM categories WHERE slug = 'electronics'),
   'Rohan Mehta',
   'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&h=100&q=80',
   '2025-05-16T09:00:00Z',
   'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=700&h=520&q=80',
   8,
   '<section id="intro"><p>The right laptop balances portability, battery and power. These are our top picks for students and professionals.</p></section><section id="picks"><h2>Top Picks</h2><p>From budget ultrabooks to powerful all-rounders.</p></section>',
   '[{"num":"01","label":"Top Picks","id":"picks"}]'::jsonb,
   '["Top Picks","What to Look For"]'::jsonb,
   TRUE, FALSE, FALSE, NOW())
ON CONFLICT (slug) DO NOTHING;
