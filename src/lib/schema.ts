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

/**
 * An affiliate link with no associate tag earns nothing, and `upsertProduct`
 * deliberately never rewrites `amazon_url` — so one untagged write is permanently
 * unpaid revenue with no error anywhere. Validate it at the door instead.
 *
 * The expected tag comes from AMAZON_AFFILIATE_TAG (read per-call so a rotated
 * value applies without a rebuild). When it is unset we still require *some*
 * `tag=`, because "no tag at all" is the failure worth catching either way.
 */
function assertAffiliateTag(raw: string, ctx: z.RefinementCtx): void {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return; // .url() already reported the malformed-URL error
  }
  const tag = url.searchParams.get("tag");
  if (!tag) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "amazonUrl must carry an affiliate tag — append ?tag=<associate-id> or the link earns no commission",
    });
    return;
  }
  const expected = process.env.AMAZON_AFFILIATE_TAG;
  if (expected && tag !== expected) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `amazonUrl carries tag "${tag}" but this site's associate id is "${expected}"`,
    });
  }
}

export const productWriteSchema = z.object({
  rank: z.number().int().positive(),
  badge: z.string(),
  name: z.string().min(1),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
  priceInr: z.number().int().nonnegative(),
  mrpInr: z.number().int().nonnegative(),
  imageUrl: z.string().url(),
  amazonUrl: z.string().url().superRefine(assertAffiliateTag),
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
