import { getProductAmazonUrl, recordAffiliateClick } from "@/lib/queries";

/**
 * Outbound affiliate click tracker: `/go/<product-id>?from=<post-slug>`.
 *
 * Amazon's Associates reports say what sold but never which page sent the
 * click, so this is the only way to compare CTR between posts. It logs the
 * click, then redirects to the product's real affiliate URL.
 *
 * Design constraints, in priority order:
 *  1. The redirect must happen even if logging fails — a lost analytics row is
 *     cheap, a lost commission is not. `recordAffiliateClick` swallows its own
 *     errors, so nothing here can reject before the Location header is sent.
 *  2. Only ids that exist in `products` redirect. The destination is read from
 *     the DB, never from the query string, so this cannot be used as an open
 *     redirect to launder traffic through our domain.
 *  3. A hand-built `Response` rather than `next/navigation`'s `redirect()`:
 *     that helper emits 307 (it preserves the request method, which matters for
 *     POSTed forms and not at all here) and signals by throwing. 302 is the
 *     honest code for "this mapping is not permanent", and `no-store` stops a
 *     browser or intermediary caching one product's destination for another.
 */

// The destination is per-request and must never be prerendered or cached.
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Reject anything that isn't a plain positive integer before touching the DB.
  const productId = /^\d+$/.test(id) ? Number(id) : NaN;
  if (!Number.isSafeInteger(productId) || productId <= 0) {
    return new Response("Not found", { status: 404 });
  }

  const destination = await getProductAmazonUrl(productId);
  if (!destination) {
    return new Response("Not found", { status: 404 });
  }

  const from = new URL(request.url).searchParams.get("from");
  await recordAffiliateClick({
    productId,
    // Cap the slug so a hand-crafted query string can't write unbounded text.
    postSlug: from ? from.slice(0, 200) : null,
    userAgent: request.headers.get("user-agent")?.slice(0, 500) ?? null,
    referrer: request.headers.get("referer")?.slice(0, 500) ?? null,
  });

  return new Response(null, {
    status: 302,
    headers: { Location: destination, "Cache-Control": "no-store" },
  });
}
