/**
 * Data seam for the site — the single import server components use.
 *
 * - Static config is re-exported from `./config` (DB-free; safe for client
 *   components to import directly from `./config` instead).
 * - DB-driven content is exposed through async getters that read Postgres via
 *   `./queries.ts`. Getters are wrapped in React `cache()` so repeated calls
 *   within one request share a single DB round-trip.
 *
 * IMPORTANT: Client Components must NOT import from this module — it pulls the
 * Node-only `pg` chain. They should import config from `./config` and types
 * from `./types`.
 *
 * See BACKEND.md "The contract" + HERMES_AGENT_FORMAT.md.
 */

import { cache } from "react";
import {
  getHeroPost as dbGetHeroPost,
  getTrending as dbGetTrending,
  listCategories as dbGetCategories,
  getLatestPosts as dbGetLatestPosts,
  getPostBySlug as dbGetPostBySlug,
  listPublishedPosts as dbListPublishedPosts,
  listPostsByKind as dbListPostsByKind,
  listDeals as dbListDeals,
  listPostSitemapEntries as dbListPostSitemapEntries,
  listCategorySitemapEntries as dbListCategorySitemapEntries,
} from "@/lib/queries";

// Re-export static config + types so server components can keep importing
// everything from `@/lib/data`.
export * from "@/lib/config";
export type { Post, Category, Product, PostDetail, TocEntry, Faq, Deal } from "@/lib/types";

import type { Post, Category, PostDetail, Deal } from "@/lib/types";

/** The home hero — the post marked is_hero, else the most recent. */
export const getHeroPost = cache(async (): Promise<Post | null> => dbGetHeroPost());

/** Trending rail in the hero section. */
export const getTrending = cache(async (limit = 5): Promise<Post[]> =>
  dbGetTrending(limit),
);

/** All categories with live article counts. */
export const getCategories = cache(async (): Promise<Category[]> => dbGetCategories());

/** Latest posts grid on the home page. */
export const getLatestPosts = cache(async (limit = 4): Promise<Post[]> =>
  dbGetLatestPosts(limit),
);

/** Full post (body, products, TOC, related, faqs, pullQuote) for /blog/[slug]. */
export const getPostBySlug = cache(
  async (slug: string): Promise<PostDetail | null> => dbGetPostBySlug(slug),
);

/** All published posts in a category, for /category/[slug]. */
export const getCategoryPosts = cache(
  async (categorySlug: string, limit = 100): Promise<{ posts: Post[]; total: number }> =>
    dbListPublishedPosts(limit, 0, categorySlug),
);

/** Reviews (posts with products) for /reviews. */
export const getReviews = cache(async (limit = 60): Promise<Post[]> =>
  dbListPostsByKind("review", limit),
);

/** Guides (posts without products) for /guides. */
export const getGuides = cache(async (limit = 60): Promise<Post[]> =>
  dbListPostsByKind("guide", limit),
);

/** Discounted products for /deals. */
export const getDeals = cache(async (limit = 24): Promise<Deal[]> =>
  dbListDeals(limit),
);

/** Slug + last-updated for every published post — feeds sitemap `<lastmod>`. */
export const getPostSitemapEntries = cache(async () =>
  dbListPostSitemapEntries(),
);

/** Category slugs with published posts — feeds sitemap category URLs. */
export const getCategorySitemapEntries = cache(async () =>
  dbListCategorySitemapEntries(),
);
