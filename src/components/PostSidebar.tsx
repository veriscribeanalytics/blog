"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Post, Product, TocEntry } from "@/lib/types";
import { ArrowRight } from "./icons";
import StarRating from "./StarRating";

/** Sticky right rail: TOC (scroll-spy) → top deal card → related articles. */
export default function PostSidebar({
  products,
  relatedArticles,
  tableOfContents,
}: {
  products: Product[];
  relatedArticles: Post[];
  tableOfContents: TocEntry[];
}) {
  const [active, setActive] = useState(
    tableOfContents[0]?.id ?? "",
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-100px 0px -65% 0px", threshold: 0 }
    );

    tableOfContents.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [tableOfContents]);

  const deal = products[0];

  return (
    <aside className="w-full lg:w-[300px] xl:w-[320px] shrink-0">
      <div className="lg:sticky lg:top-24 space-y-6">
        {/* ── table of contents ─────────────────────────────────────── */}
        {tableOfContents.length > 0 && (
        <nav className="bg-paper border border-line p-5">
          <h2 className="text-[17px] mb-4">Table of Contents</h2>
          <ol className="space-y-2.5">
            {tableOfContents.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`flex gap-3 text-[13px] leading-snug transition-colors ${
                    active === item.id
                      ? "text-bronze font-medium"
                      : "text-body hover:text-bronze"
                  }`}
                >
                  <span className="text-muted tabular-nums">{item.num}.</span>
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
        )}

        {/* ── top affiliate deal ────────────────────────────────────── */}
        {deal && (
        <div className="bg-paper border border-line p-5">
          <h2 className="text-[17px] mb-4">Top Affiliate Deal</h2>
          <div className="relative aspect-square overflow-hidden mb-3">
            <Image
              src={deal.image}
              alt={deal.name}
              fill
              sizes="320px"
              className="object-cover"
            />
          </div>
          <h3 className="font-sans text-[14px] font-semibold leading-snug">
            {deal.name}
          </h3>
          <div className="mt-2">
            <StarRating rating={deal.rating} reviews={deal.reviews} />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-[22px] font-serif">{deal.price}</span>
            <span className="text-[13px] line-through text-muted">{deal.mrp}</span>
          </div>
          <a
            href={deal.amazonUrl}
            target="_blank"
            rel="nofollow sponsored noopener"
            className="mt-4 flex items-center justify-center gap-2 bg-ink text-cream text-[13px] font-medium py-2.5 hover:bg-bronze-deep transition-colors"
          >
            View on Amazon <ArrowRight size={13} />
          </a>
          <p className="mt-3 text-[11px] text-muted text-center">
            {deal.updated}
          </p>
        </div>
        )}

        {/* ── related articles ──────────────────────────────────────── */}
        {relatedArticles.length > 0 && (
        <div className="bg-paper border border-line p-5">
          <h2 className="text-[17px] mb-4">Related Articles</h2>
          <div className="space-y-4">
            {relatedArticles.map((a) => (
              <Link key={a.slug} href={`/blog/${a.slug}`} className="flex gap-3 group">
                <div className="relative w-14 h-14 shrink-0 overflow-hidden">
                  <Image
                    src={a.image}
                    alt={a.title}
                    fill
                    sizes="56px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium leading-snug line-clamp-2 group-hover:text-bronze transition-colors">
                    {a.title}
                  </p>
                  <p className="mt-1 text-[11px] text-muted">{a.date}</p>
                </div>
              </Link>
            ))}
          </div>
          <Link
            href="/blog"
            className="mt-5 inline-flex items-center gap-2 text-[12.5px] text-body hover:text-bronze transition-colors"
          >
            View all articles <ArrowRight size={12} />
          </Link>
        </div>
        )}
      </div>
    </aside>
  );
}
