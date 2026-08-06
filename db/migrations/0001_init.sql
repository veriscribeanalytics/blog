-- AffiliBlog — initial schema (local Postgres)
-- Run once after creating the `affiliblog` database.
-- See BACKEND.md "Database schema" + HERMES_AGENT_FORMAT.md.

CREATE TABLE IF NOT EXISTS categories (
  id        SERIAL PRIMARY KEY,
  slug      TEXT UNIQUE NOT NULL,
  name      TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posts (
  id               SERIAL PRIMARY KEY,
  slug             TEXT UNIQUE NOT NULL,
  title            TEXT NOT NULL,
  excerpt          TEXT,
  category_id      INT REFERENCES categories(id),
  author_name      TEXT,
  author_avatar    TEXT,
  published_at     TIMESTAMPTZ,
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  hero_image_url   TEXT,
  read_time_minutes INT,
  body             TEXT,                  -- HTML; the post page renders this
  table_of_contents JSONB,               -- [{ num, label, id }]
  in_this_article   JSONB,                -- ["...","..."]
  pull_quote        TEXT,                 -- editorial blockquote
  faqs              JSONB,                -- [{ q, a }]
  is_published      BOOLEAN DEFAULT FALSE,
  is_hero           BOOLEAN DEFAULT FALSE,
  is_trending       BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  image_url    TEXT,
  amazon_url   TEXT UNIQUE NOT NULL,      -- one row per Amazon listing
  price_inr    INT,                        -- paise (e.g. 249900 = ₹2,499)
  mrp_inr      INT,
  rating       NUMERIC(2,1),              -- 4.5
  review_count INT,
  pros         JSONB,                     -- ["...","..."]
  why_picked   TEXT,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- join: a product can appear in many posts; placement metadata lives here
CREATE TABLE IF NOT EXISTS post_products (
  post_id      INT REFERENCES posts(id) ON DELETE CASCADE,
  product_id   INT REFERENCES products(id) ON DELETE CASCADE,
  display_order INT,
  rank_num      INT,                       -- 1..N -> "#1"
  badge         TEXT,                      -- "#1 Best Overall" (per placement)
  PRIMARY KEY (post_id, product_id)
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id        SERIAL PRIMARY KEY,
  email     TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_posts_slug         ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published    ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category    ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_is_published ON posts(is_published);
CREATE INDEX IF NOT EXISTS idx_posts_is_hero      ON posts(is_hero);
CREATE INDEX IF NOT EXISTS idx_posts_is_trending  ON posts(is_trending);
CREATE INDEX IF NOT EXISTS idx_categories_slug   ON categories(slug);
