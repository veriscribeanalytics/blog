import { z } from "zod";
import { sanitizePostBody } from "@/lib/sanitize";

/**
 * Validation for the Hermes agent's POST/PUT payload.
 * Mirrors HERMES_AGENT_FORMAT.md §5 exactly. Reject with 400 + field messages
 * so the agent can self-correct.
 *
 * Display strings (date, readTime, price, reviews, discount) are NOT here —
 * they're derived in src/lib/format.ts from the raw fields below.
 */
export const tocEntrySchema = z.object({
  num: z.string(),
  label: z.string(),
  id: z.string(),
});

export const faqSchema = z.object({
  q: z.string().min(1),
  a: z.string().min(1),
});

export const productWriteSchema = z.object({
  rank: z.number().int().positive(),
  badge: z.string(),
  name: z.string().min(1),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
  priceInr: z.number().int().nonnegative(),
  mrpInr: z.number().int().nonnegative(),
  imageUrl: z.string().url(),
  amazonUrl: z.string().url(),
  pros: z.array(z.string()),
  whyPicked: z.string(),
});

export const postWriteSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "slug must be lowercase letters, digits and hyphens only"),
  title: z.string().min(1).max(300),
  excerpt: z.string().min(1).max(600),
  category: z.string().min(1),
  authorName: z.string().min(1),
  authorAvatar: z.string().url(),
  publishedAt: z.string().datetime(),
  heroImageUrl: z.string().url(),
  readTimeMinutes: z.number().int().positive(),
  // Sanitized before it reaches the DB — the post page renders this as raw HTML.
  // Re-checked non-empty afterwards so a body that was *entirely* disallowed
  // markup is a 400 the agent can act on, not a silently blank article.
  body: z
    .string()
    .min(1)
    .transform(sanitizePostBody)
    .refine((v) => v.trim().length > 0, {
      message: "body contained no allowed HTML after sanitization",
    }),
  tableOfContents: z.array(tocEntrySchema),
  inThisArticle: z.array(z.string()),
  faqs: z.array(faqSchema).optional(),
  pullQuote: z.string().optional(),
  isPublished: z.boolean(),
  isHero: z.boolean(),
  isTrending: z.boolean(),
  products: z.array(productWriteSchema),
});

export type PostWrite = z.infer<typeof postWriteSchema>;
export type ProductWrite = z.infer<typeof productWriteSchema>;
export type TocEntry = z.infer<typeof tocEntrySchema>;
export type Faq = z.infer<typeof faqSchema>;
