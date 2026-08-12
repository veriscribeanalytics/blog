import Image from "next/image";
import StarRating from "./StarRating";
import { AFFILIATE_REL, affiliateHref } from "@/lib/affiliate";
import type { Product } from "@/lib/types";

/**
 * Compact "best overall" card for the top of a post page.
 *
 * Without it the first price, star or buy button on a post sits below the hero,
 * the trust strip, the disclosure, the TOC and the entire article body — so a
 * reader who wants the answer has to read the whole review to find it. This puts
 * the top pick and a jump link to the full rankings above the fold.
 *
 * Only renders facts already shown further down the page (name, rating, price,
 * MRP), so it adds no claim the structured data doesn't already carry.
 */
export default function TopPickCard({
  p,
  postSlug,
}: {
  p: Product;
  postSlug: string;
}) {
  return (
    <div className="mt-7 border border-line bg-paper p-4 max-w-xl">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-bronze">
          {p.badge || "Our Top Pick"}
        </span>
        <a
          href="#top-5"
          className="ml-auto text-[12px] text-body underline decoration-line hover:text-bronze transition-colors"
        >
          See all {p.rank === "#1" ? "picks" : "rankings"} ↓
        </a>
      </div>

      <div className="flex gap-4">
        {p.image && (
          <div className="relative w-20 h-20 shrink-0 overflow-hidden">
            <Image
              src={p.image}
              alt={p.name}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h2 className="font-sans text-[14px] font-semibold leading-snug line-clamp-2">
            {p.name}
          </h2>
          <div className="mt-1.5">
            <StarRating rating={p.rating} reviews={p.reviews} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[20px] font-serif text-ink">{p.price}</span>
            {p.mrp && (
              <span className="text-[13px] line-through text-muted">{p.mrp}</span>
            )}
            {p.discount && (
              <span className="text-[11px] font-semibold text-leaf bg-leaf/10 px-1.5 py-0.5">
                {p.discount}
              </span>
            )}
          </div>
        </div>
      </div>

      <a
        href={affiliateHref(p, postSlug)}
        target="_blank"
        rel={AFFILIATE_REL}
        className="mt-4 flex items-center justify-center gap-2 bg-bronze text-paper text-[13px] font-semibold py-2.5 hover:bg-bronze-deep transition-colors"
      >
        Check price on Amazon →
      </a>
    </div>
  );
}
