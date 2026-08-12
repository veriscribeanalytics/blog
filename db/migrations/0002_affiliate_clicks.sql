-- AffiliBlog — outbound affiliate click log
-- Idempotent; safe to re-run. Apply to local and to Neon (see DEPLOY.md).
--
-- Why this exists: Amazon's Associates reports say *what* sold, never *which
-- page* sent the click. Without a first-party log there is no way to compare
-- CTR between posts, so there is no way to know which content earns.

CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id         BIGSERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  -- Denormalised on purpose: the referring post is the whole point of the
  -- table, and keeping the slug as text means a deleted post doesn't erase
  -- the history of what it earned.
  post_slug  TEXT,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Coarse attribution only. No IP, no cookie, no per-visitor id: the point is
  -- comparing pages, not profiling readers, and storing less keeps the privacy
  -- page honest.
  user_agent TEXT,
  referrer   TEXT
);

CREATE INDEX IF NOT EXISTS idx_clicks_post    ON affiliate_clicks(post_slug);
CREATE INDEX IF NOT EXISTS idx_clicks_product ON affiliate_clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_clicks_at      ON affiliate_clicks(clicked_at DESC);

-- Belt-and-braces for the revenue invariant the zod schema now enforces on
-- write. A row that reaches the DB by any other path (psql, a future importer)
-- still cannot carry an untagged link.
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_amazon_url_has_tag;
ALTER TABLE products ADD CONSTRAINT products_amazon_url_has_tag
  CHECK (amazon_url LIKE '%tag=%');
