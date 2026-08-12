/**
 * Outbound affiliate link helpers.
 *
 * Every buy button on the site goes through `/go/<id>` so the click is logged
 * before the reader leaves — see `src/app/go/[id]/route.ts` for why. Keeping the
 * href and rel construction here means a render site can't quietly drop the
 * tracking or the rel attributes.
 *
 * Client-safe: no DB imports.
 */

import type { Product } from "@/lib/types";

/**
 * `rel` for a paid outbound link.
 *
 * `nofollow sponsored` is required by Google for affiliate links. `noopener`
 * prevents the opened tab reaching back through `window.opener`. `noreferrer`
 * is deliberately absent — Amazon attributes the sale from the `tag` parameter,
 * but sending the referrer keeps our domain visible in their reporting.
 */
export const AFFILIATE_REL = "nofollow sponsored noopener";

/**
 * Tracked href for a product's buy button.
 *
 * `postSlug` attributes the click to the page it came from; omit it where there
 * is no single referring post. Falls back to the raw Amazon URL if the product
 * somehow has no id, so a missing id costs analytics rather than the sale.
 */
export function affiliateHref(p: Product, postSlug?: string): string {
  if (!p.id) return p.amazonUrl;
  const from = postSlug ? `?from=${encodeURIComponent(postSlug)}` : "";
  return `/go/${p.id}${from}`;
}
