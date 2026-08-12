import { AFFILIATE_REL, affiliateHref } from "@/lib/affiliate";
import type { Product } from "@/lib/types";

/**
 * Bottom-anchored buy bar, mobile only.
 *
 * On mobile the sidebar deal card stacks *after* the whole article, so a reader
 * scrolling the review has no buy action in reach until they reach the end. This
 * keeps the top pick's price and CTA permanently available.
 *
 * Deliberately always visible rather than revealed on scroll: showing it needs no
 * `"use client"`, no scroll listener and no JS on the critical path. The page
 * reserves space for it with `pb-24 lg:pb-0` so it never covers content.
 */
export default function StickyBuyBar({
  p,
  postSlug,
}: {
  p: Product;
  postSlug: string;
}) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-paper/95 backdrop-blur-sm px-4 py-2.5 flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted truncate">{p.badge || "Top pick"}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-[17px] font-serif text-ink">{p.price}</span>
          {p.discount && (
            <span className="text-[10.5px] font-semibold text-leaf">
              {p.discount}
            </span>
          )}
        </div>
      </div>
      <a
        href={affiliateHref(p, postSlug)}
        target="_blank"
        rel={AFFILIATE_REL}
        className="shrink-0 bg-bronze text-paper text-[13px] font-semibold px-5 py-2.5 hover:bg-bronze-deep transition-colors"
      >
        Buy on Amazon
      </a>
    </div>
  );
}
