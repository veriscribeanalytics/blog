/**
 * Display types shared by the API layer and the frontend seam (`data.ts`).
 * These match the shapes `src/lib/data.ts` already exports so components keep
 * importing the same names. Display strings are derived from raw fields — never
 * sent by the agent. See BACKEND.md "The contract".
 */

export type Post = {
  slug: string;
  title: string;
  category: string;
  date: string; // display: "May 20, 2025"
  readTime: string; // display: "6 min read"
  image: string;
  excerpt?: string;
};

export type Category = {
  name: string;
  count: string; // display: "128 Articles"
  image: string;
  slug: string;
};

export type Product = {
  rank: string; // display: "#1"
  badge: string;
  name: string;
  rating: number; // 0–5, half-star precision
  reviews: string; // display: "12,345 reviews"
  price: string; // display: "₹2,499"
  mrp: string; // display: "₹4,990"
  discount: string; // display: "50% OFF"
  image: string;
  amazonUrl: string; // the affiliate link — already carries ?tag=affiliblog-21
  pros: string[];
  why: string;
  updated: string; // display: "Updated 2 hours ago"
  /**
   * Raw values kept alongside the display strings for structured data —
   * schema.org needs machine-readable numbers ("2499"), not "₹2,499".
   * Rupees, not paise. Null when the DB column was null.
   */
  priceValue: number | null;
  mrpValue: number | null;
  reviewCount: number | null;
};

export type TocEntry = { num: string; label: string; id: string };
export type Faq = { q: string; a: string };

/** A discounted product plus the post it was reviewed in — powers /deals. */
export type Deal = Product & {
  postSlug: string;
  postTitle: string;
};

export type PostDetail = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  authorName: string;
  authorAvatar: string;
  publishedAt: string; // ISO
  date: string; // display
  readTime: string; // display
  readTimeMinutes: number;
  heroImage: string;
  body: string; // HTML
  tableOfContents: TocEntry[];
  inThisArticle: string[];
  faqs?: Faq[];
  pullQuote?: string;
  isHero: boolean;
  isTrending: boolean;
  products: Product[];
  relatedArticles: Post[];
};
