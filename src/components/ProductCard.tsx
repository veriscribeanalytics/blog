import Image from "next/image";
import { Check } from "./icons";
import StarRating from "./StarRating";
import type { Product } from "@/lib/data";

export default function ProductCard({ p }: { p: Product }) {
  return (
    <div
      id={`product-${p.rank.replace("#", "")}`}
      className="border border-line bg-paper flex scroll-mt-28 overflow-hidden"
    >
      {/* dark olive vertical rank rail */}
      <div className="w-14 lg:w-16 shrink-0 bg-olive text-paper flex items-center justify-center">
        <span className="font-serif text-[28px] lg:text-[32px] -rotate-0 tracking-tight">
          {p.rank.replace("#", "")}
        </span>
      </div>

      {/* content area */}
      <div className="flex-1 min-w-0">
        {/* top badge banner */}
        <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-line-soft">
          <span className="text-[13px] font-semibold text-bronze">{p.badge}</span>
          <span className="ml-auto text-[11px] text-muted">{p.updated}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 p-5">
          {/* main product image */}
          <div className="relative shrink-0 w-full lg:w-[200px] aspect-square overflow-hidden self-start">
            <Image
              src={p.image}
              alt={p.name}
              fill
              sizes="(max-width: 1024px) 100vw, 200px"
              className="object-cover"
            />
          </div>

          {/* info column */}
          <div className="flex-1 min-w-0">
            <h3 className="text-[20px] leading-snug">{p.name}</h3>

            <div className="mt-2">
              <StarRating rating={p.rating} reviews={p.reviews} />
            </div>

            {/* pricing row */}
            <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-[24px] font-serif text-ink">{p.price}</span>
              <span className="text-[15px] line-through text-muted">{p.mrp}</span>
              <span className="text-[12px] font-semibold text-leaf bg-leaf/10 px-2 py-0.5">
                {p.discount}
              </span>
            </div>

            {/* pros */}
            <ul className="mt-4 space-y-2">
              {p.pros.map((pro) => (
                <li key={pro} className="flex items-start gap-2 text-[13.5px] text-body">
                  <Check size={14} className="text-leaf mt-0.5 shrink-0" />
                  {pro}
                </li>
              ))}
            </ul>

            {/* CTA row: View on Amazon button */}
            <div className="mt-5 flex items-center gap-3">
              <a
                href={p.amazonUrl}
                target="_blank"
                rel="nofollow sponsored noopener"
                className="inline-flex items-center gap-2 bg-ink text-cream text-[13px] font-semibold px-7 py-2.5 hover:bg-olive transition-colors"
              >
                View on Amazon →
              </a>
            </div>
          </div>

          {/* second lifestyle image — desktop only, right column */}
          <div className="hidden xl:block relative w-[180px] shrink-0 aspect-square overflow-hidden self-start">
            <Image
              src={p.image}
              alt={`${p.name} lifestyle`}
              fill
              sizes="180px"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
