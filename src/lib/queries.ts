import { query, one, withTransaction } from "@/lib/db";
import {
  formatDate,
  formatRank,
  formatReviews,
  formatPrice,
  formatDiscount,
  formatUpdated,
  formatReadTime,
  formatCount,
  slugify,
} from "@/lib/format";
import type { PostWrite } from "@/lib/schema";
import { sanitizePostBody } from "@/lib/sanitize";
import type { Category, Deal, Post, PostDetail, Product, TocEntry, Faq } from "@/lib/types";

/* ----------------------------- row shapes ------------------------------ */

interface PostRow {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  author_name: string | null;
  author_avatar: string | null;
  published_at: string | null;
  updated_at: string | null;
  hero_image_url: string | null;
  read_time_minutes: number | null;
  body: string | null;
  table_of_contents: TocEntry[] | null;
  in_this_article: string[] | null;
  pull_quote: string | null;
  faqs: Faq[] | null;
  is_published: boolean | null;
  is_hero: boolean | null;
  is_trending: boolean | null;
  category_id: number | null;
  category_name: string | null;
  category_slug: string | null;
}

interface ProductRow {
  id: number;
  name: string;
  image_url: string | null;
  amazon_url: string;
  price_inr: number | null;
  mrp_inr: number | null;
  rating: string | number | null;
  review_count: number | null;
  pros: string[] | null;
  why_picked: string | null;
  updated_at: string | null;
  rank_num: number | null;
  badge: string | null;
  display_order: number | null;
}

interface CategoryRow {
  id: number;
  slug: string;
  name: string;
  image_url: string | null;
  post_count: string;
}

/* ------------------------------- mappers -------------------------------- */

/**
 * TIMESTAMPTZ -> ISO string.
 *
 * `pg` hands back `Date` objects for timestamp columns, so the `string` types on
 * the row interfaces are a lie that leaks: `JSON.stringify` happens to serialize
 * a Date correctly (which is why JSON-LD looked fine) but Next's metadata
 * serializer does not, and `article:published_time` shipped as `[object Object]`.
 * Normalise at the boundary so everything downstream really is a string.
 */
function isoOrEmpty(v: unknown): string {
  if (!v) return "";
  const d = v instanceof Date ? v : new Date(String(v));
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

function mapPost(r: PostRow): Post {
  return {
    slug: r.slug,
    title: r.title,
    category: r.category_name ?? "",
    date: formatDate(r.published_at),
    readTime: formatReadTime(r.read_time_minutes),
    image: r.hero_image_url ?? "",
    excerpt: r.excerpt ?? undefined,
  };
}

function mapProduct(r: ProductRow): Product {
  return {
    id: r.id,
    rank: formatRank(r.rank_num),
    badge: r.badge ?? "",
    name: r.name,
    rating: r.rating == null ? 0 : Number(r.rating),
    reviews: formatReviews(r.review_count),
    price: formatPrice(r.price_inr),
    mrp: formatPrice(r.mrp_inr),
    discount: formatDiscount(r.price_inr, r.mrp_inr),
    image: r.image_url ?? "",
    amazonUrl: r.amazon_url,
    pros: Array.isArray(r.pros) ? r.pros : [],
    why: r.why_picked ?? "",
    updated: formatUpdated(r.updated_at),
    // paise -> rupees for schema.org; the display strings above stay untouched.
    priceValue: r.price_inr == null ? null : r.price_inr / 100,
    mrpValue: r.mrp_inr == null ? null : r.mrp_inr / 100,
    reviewCount: r.review_count ?? null,
  };
}

/* ------------------------------- reads ---------------------------------- */

const POST_LIST_COLS = `
  p.id, p.slug, p.title, p.excerpt, p.author_name, p.author_avatar,
  p.published_at, p.updated_at, p.hero_image_url, p.read_time_minutes,
  p.body, p.table_of_contents, p.in_this_article, p.pull_quote, p.faqs,
  p.is_published, p.is_hero, p.is_trending, p.category_id,
  c.name AS category_name, c.slug AS category_slug
`;

/**
 * Published posts, newest first.
 *
 * `withTotal` gates a second COUNT(*) query. Only the API route paginates, so
 * the page routes skip it rather than paying for a number they discard.
 */
export async function listPublishedPosts(
  limit = 20,
  offset = 0,
  categorySlug?: string,
  withTotal = false,
): Promise<{ posts: Post[]; total: number }> {
  const where = categorySlug ? `AND c.slug = $3` : "";
  const params = categorySlug
    ? [limit, offset, categorySlug]
    : [limit, offset];
  const rows = await query<PostRow>(
    `SELECT ${POST_LIST_COLS}
       FROM posts p
       LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.is_published = TRUE ${where}
      ORDER BY p.published_at DESC NULLS LAST
      LIMIT $1 OFFSET $2`,
    params,
  );
  const posts = rows.map(mapPost);
  if (!withTotal) {
    // Exact when the page isn't truncated, which is the only case a caller that
    // opted out could care about.
    return { posts, total: posts.length };
  }
  const countRow = await one<{ count: string }>(
    `SELECT COUNT(*)::text AS count
       FROM posts p
       LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.is_published = TRUE ${categorySlug ? "AND c.slug = $1" : ""}`,
    categorySlug ? [categorySlug] : [],
  );
  return { posts, total: countRow ? Number(countRow.count) : 0 };
}

/**
 * Split the post list by whether a post carries ranked products.
 *
 * The schema has no `post_type` column, and it doesn't need one: a *review* is a
 * post with products in `post_products`, a *guide* is a post without. Deriving
 * it keeps /reviews and /guides honest with zero agent-facing changes.
 */
export async function listPostsByKind(
  kind: "review" | "guide",
  limit = 60,
): Promise<Post[]> {
  const test = kind === "review" ? "EXISTS" : "NOT EXISTS";
  const rows = await query<PostRow>(
    `SELECT ${POST_LIST_COLS}
       FROM posts p
       LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.is_published = TRUE
        AND ${test} (SELECT 1 FROM post_products pp WHERE pp.post_id = p.id)
      ORDER BY p.published_at DESC NULLS LAST
      LIMIT $1`,
    [limit],
  );
  return rows.map(mapPost);
}

/** A deal = a product priced below MRP, newest discount first. */
export async function listDeals(limit = 24): Promise<Deal[]> {
  const rows = await query<ProductRow & { post_slug: string | null; post_title: string | null }>(
    `SELECT pr.*, pp.rank_num, pp.badge, pp.display_order,
            p.slug AS post_slug, p.title AS post_title
       FROM products pr
       JOIN post_products pp ON pp.product_id = pr.id
       JOIN posts p ON p.id = pp.post_id
      WHERE p.is_published = TRUE
        AND pr.mrp_inr IS NOT NULL
        AND pr.price_inr IS NOT NULL
        AND pr.mrp_inr > pr.price_inr
      ORDER BY (pr.mrp_inr - pr.price_inr)::numeric / pr.mrp_inr DESC,
               pr.updated_at DESC
      LIMIT $1`,
    [limit],
  );
  // One row per product — the same listing can appear in several posts.
  const seen = new Set<number>();
  const deals: Deal[] = [];
  for (const r of rows) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    deals.push({
      ...mapProduct(r),
      postSlug: r.post_slug ?? "",
      postTitle: r.post_title ?? "",
    });
  }
  return deals;
}

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {  const post = await one<PostRow>(
    `SELECT ${POST_LIST_COLS}
       FROM posts p
       LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.slug = $1 AND p.is_published = TRUE`,
    [slug],
  );
  if (!post || post.id == null) return null;

  // Products and related posts are independent of each other, so overlap the
  // two round-trips rather than paying for them in series.
  const [products, relRows] = await Promise.all([
    query<ProductRow>(
      `SELECT pr.*, pp.rank_num, pp.badge, pp.display_order
         FROM post_products pp
         JOIN products pr ON pr.id = pp.product_id
        WHERE pp.post_id = $1
        ORDER BY pp.display_order ASC`,
      [post.id],
    ),
    post.category_id == null
      ? Promise.resolve([] as PostRow[])
      : query<PostRow>(
          `SELECT ${POST_LIST_COLS}
             FROM posts p
             LEFT JOIN categories c ON c.id = p.category_id
            WHERE p.category_id = $1 AND p.id <> $2 AND p.is_published = TRUE
            ORDER BY p.published_at DESC NULLS LAST
            LIMIT 3`,
          [post.category_id, post.id],
        ),
  ]);
  const related: Post[] = relRows.map(mapPost);

  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt ?? "",
    category: post.category_name ?? "",
    categorySlug: post.category_slug ?? slugify(post.category_name ?? ""),
    authorName: post.author_name ?? "",
    authorAvatar: post.author_avatar ?? "",
    publishedAt: isoOrEmpty(post.published_at),
    updatedAt: isoOrEmpty(post.updated_at),
    date: formatDate(post.published_at),
    readTime: formatReadTime(post.read_time_minutes),
    readTimeMinutes: post.read_time_minutes ?? 0,
    heroImage: post.hero_image_url ?? "",
    // Sanitized on write too, but rows predating that (or seeded directly via
    // SQL) still flow through here — the render path must not trust the column.
    body: sanitizePostBody(post.body ?? ""),
    tableOfContents: Array.isArray(post.table_of_contents)
      ? post.table_of_contents
      : [],
    inThisArticle: Array.isArray(post.in_this_article) ? post.in_this_article : [],
    faqs: Array.isArray(post.faqs) ? post.faqs : undefined,
    pullQuote: post.pull_quote ?? undefined,
    isHero: Boolean(post.is_hero),
    isTrending: Boolean(post.is_trending),
    products: products.map(mapProduct),
    relatedArticles: related,
  };
}

export async function listCategories(): Promise<Category[]> {
  const rows = await query<CategoryRow>(
    `SELECT c.id, c.slug, c.name, c.image_url,
            COALESCE(COUNT(p.id), 0)::text AS post_count
       FROM categories c
       LEFT JOIN posts p ON p.category_id = c.id AND p.is_published = TRUE
      GROUP BY c.id, c.slug, c.name, c.image_url
      ORDER BY post_count DESC, c.name ASC`,
  );
  return rows.map((r) => ({
    name: r.name,
    count: formatCount(Number(r.post_count)),
    image: r.image_url ?? "",
    slug: r.slug,
  }));
}

export async function getHeroPost(): Promise<Post | null> {
  const row = await one<PostRow>(
    `SELECT ${POST_LIST_COLS}
       FROM posts p
       LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.is_published = TRUE
      ORDER BY (p.is_hero = TRUE) DESC, p.published_at DESC NULLS LAST
      LIMIT 1`,
  );
  return row && row.id != null ? mapPost(row) : null;
}

export async function getTrending(limit = 5): Promise<Post[]> {
  const rows = await query<PostRow>(
    `SELECT ${POST_LIST_COLS}
       FROM posts p
       LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.is_published = TRUE
      ORDER BY (p.is_trending = TRUE) DESC, p.published_at DESC NULLS LAST
      LIMIT $1`,
    [limit],
  );
  return rows.map(mapPost);
}

export async function getLatestPosts(limit = 4): Promise<Post[]> {
  const rows = await query<PostRow>(
    `SELECT ${POST_LIST_COLS}
       FROM posts p
       LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.is_published = TRUE
      ORDER BY p.published_at DESC NULLS LAST
      LIMIT $1`,
    [limit],
  );
  return rows.map(mapPost);
}

/**
 * Slug + timestamp for every published post — feeds `<lastmod>` in the sitemap.
 * Deliberately narrow: the sitemap needs no body, products or joins.
 */
export async function listPostSitemapEntries(): Promise<
  { slug: string; updatedAt: string | null }[]
> {
  const rows = await query<{ slug: string; updated_at: string | null }>(
    `SELECT slug, COALESCE(updated_at, published_at) AS updated_at
       FROM posts
      WHERE is_published = TRUE
      ORDER BY COALESCE(updated_at, published_at) DESC NULLS LAST`,
  );
  return rows.map((r) => ({ slug: r.slug, updatedAt: isoOrEmpty(r.updated_at) || null }));
}

/** Category slugs that actually have published posts — empty ones are noise. */
export async function listCategorySitemapEntries(): Promise<
  { slug: string; updatedAt: string | null }[]
> {
  const rows = await query<{ slug: string; updated_at: string | null }>(
    `SELECT c.slug, MAX(COALESCE(p.updated_at, p.published_at)) AS updated_at
       FROM categories c
       JOIN posts p ON p.category_id = c.id AND p.is_published = TRUE
      GROUP BY c.slug
      ORDER BY c.slug ASC`,
  );
  return rows.map((r) => ({ slug: r.slug, updatedAt: isoOrEmpty(r.updated_at) || null }));
}

/* ------------------------------- writes --------------------------------- */

/** upsert a product by amazon_url, returning its id */
async function upsertProduct(
  client: import("pg").PoolClient,
  p: PostWrite["products"][number],
): Promise<number> {
  const res = await client.query<{ id: string }>(
    `INSERT INTO products
       (name, image_url, amazon_url, price_inr, mrp_inr, rating,
        review_count, pros, why_picked, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
     ON CONFLICT (amazon_url) DO UPDATE SET
       name = EXCLUDED.name,
       image_url = EXCLUDED.image_url,
       price_inr = EXCLUDED.price_inr,
       mrp_inr = EXCLUDED.mrp_inr,
       rating = EXCLUDED.rating,
       review_count = EXCLUDED.review_count,
       pros = EXCLUDED.pros,
       why_picked = EXCLUDED.why_picked,
       updated_at = NOW()
     RETURNING id`,
    [
      p.name,
      p.imageUrl,
      p.amazonUrl,
      p.priceInr,
      p.mrpInr,
      p.rating,
      p.reviewCount,
      JSON.stringify(p.pros),
      p.whyPicked,
    ],
  );
  return Number(res.rows[0].id);
}

export async function createPost(input: PostWrite): Promise<string> {
  return withTransaction(async (client) => {
    const categorySlug = slugify(input.category);
    const catRes = await client.query<{ id: string }>(
      `INSERT INTO categories (slug, name) VALUES ($1, $2)
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [categorySlug, input.category],
    );
    const categoryId = Number(catRes.rows[0].id);

    const postRes = await client.query<{ id: string }>(
      `INSERT INTO posts
         (slug, title, excerpt, category_id, author_name, author_avatar,
          published_at, hero_image_url, read_time_minutes, body,
          table_of_contents, in_this_article, pull_quote, faqs,
          is_published, is_hero, is_trending, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17, NOW())
       RETURNING id`,
      [
        input.slug,
        input.title,
        input.excerpt,
        categoryId,
        input.authorName,
        input.authorAvatar,
        input.publishedAt,
        input.heroImageUrl,
        input.readTimeMinutes,
        input.body,
        JSON.stringify(input.tableOfContents),
        JSON.stringify(input.inThisArticle),
        input.pullQuote ?? null,
        input.faqs ? JSON.stringify(input.faqs) : null,
        input.isPublished,
        input.isHero,
        input.isTrending,
      ],
    );
    const postId = Number(postRes.rows[0].id);

    await linkProducts(client, postId, input.products);
    return input.slug;
  });
}

export async function updatePost(
  slug: string,
  input: PostWrite,
): Promise<string | null> {
  return withTransaction(async (client) => {
    const found = await client.query<{ id: string }>(
      `SELECT id FROM posts WHERE slug = $1`,
      [slug],
    );
    if (found.rowCount === 0) return null;
    const postId = Number(found.rows[0].id);

    const categorySlug = slugify(input.category);
    const catRes = await client.query<{ id: string }>(
      `INSERT INTO categories (slug, name) VALUES ($1, $2)
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [categorySlug, input.category],
    );
    const categoryId = Number(catRes.rows[0].id);

    await client.query(
      `UPDATE posts SET
         title = $2, excerpt = $3, category_id = $4, author_name = $5,
         author_avatar = $6, published_at = $7, hero_image_url = $8,
         read_time_minutes = $9, body = $10, table_of_contents = $11,
         in_this_article = $12, pull_quote = $13, faqs = $14,
         is_published = $15, is_hero = $16, is_trending = $17, updated_at = NOW()
       WHERE slug = $1`,
      [
        slug,
        input.title,
        input.excerpt,
        categoryId,
        input.authorName,
        input.authorAvatar,
        input.publishedAt,
        input.heroImageUrl,
        input.readTimeMinutes,
        input.body,
        JSON.stringify(input.tableOfContents),
        JSON.stringify(input.inThisArticle),
        input.pullQuote ?? null,
        input.faqs ? JSON.stringify(input.faqs) : null,
        input.isPublished,
        input.isHero,
        input.isTrending,
      ],
    );

    await client.query(`DELETE FROM post_products WHERE post_id = $1`, [postId]);
    await linkProducts(client, postId, input.products);
    return input.slug;
  });
}

async function linkProducts(
  client: import("pg").PoolClient,
  postId: number,
  products: PostWrite["products"],
): Promise<void> {
  for (const p of products) {
    const productId = await upsertProduct(client, p);
    await client.query(
      `INSERT INTO post_products
         (post_id, product_id, display_order, rank_num, badge)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (post_id, product_id) DO UPDATE SET
         display_order = EXCLUDED.display_order,
         rank_num = EXCLUDED.rank_num,
         badge = EXCLUDED.badge`,
      [postId, productId, p.rank, p.rank, p.badge],
    );
  }
}

export async function softDeletePost(slug: string): Promise<boolean> {
  const row = await one<{ id: string }>(
    `UPDATE posts SET is_published = FALSE, updated_at = NOW()
      WHERE slug = $1 RETURNING id`,
    [slug],
  );
  return row != null;
}

/* ------------------------------ newsletter ------------------------------ */

export async function subscribeEmail(email: string): Promise<boolean> {
  const row = await one<{ id: string }>(
    `INSERT INTO newsletter_subscribers (email) VALUES ($1)
      ON CONFLICT (email) DO NOTHING RETURNING id`,
    [email],
  );
  return row != null;
}

/* --------------------------- affiliate clicks --------------------------- */

/** The destination for an outbound click, looked up by product id. */
export async function getProductAmazonUrl(id: number): Promise<string | null> {
  const row = await one<{ amazon_url: string }>(
    `SELECT amazon_url FROM products WHERE id = $1`,
    [id],
  );
  return row?.amazon_url ?? null;
}

/**
 * Record one outbound click. Never throws — see the caller in
 * `/go/[id]/route.ts`: losing a row of analytics must not cost a commission.
 */
export async function recordAffiliateClick(input: {
  productId: number;
  postSlug: string | null;
  userAgent: string | null;
  referrer: string | null;
}): Promise<void> {
  try {
    await query(
      `INSERT INTO affiliate_clicks (product_id, post_slug, user_agent, referrer)
       VALUES ($1, $2, $3, $4)`,
      [input.productId, input.postSlug, input.userAgent, input.referrer],
    );
  } catch (err) {
    console.error(
      "[clicks] failed to record click",
      err instanceof Error ? err.message : err,
    );
  }
}
