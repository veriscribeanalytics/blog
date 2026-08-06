"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Post } from "@/lib/types";
import AccentTitle from "./AccentTitle";
import { ArrowLeft, ArrowRight } from "./icons";

export default function HeroSection({
  heroPost,
  trending,
}: {
  heroPost: Post;
  trending: Post[];
}) {
  const [slide, setSlide] = useState(0);
  const slides = [heroPost, ...trending.filter((t) => t.slug !== heroPost.slug)];
  const total = slides.length;
  const current = slides[slide] ?? heroPost;

  return (
    <section className="mx-auto max-w-page w-full px-5 lg:px-8 pt-8 pb-6">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* ── left: hero post — image leads, headline sits over it ─────── */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/blog/${current.slug}`}
            className="group block relative overflow-hidden aspect-[4/3] sm:aspect-[3/2] lg:aspect-[4/3]"
          >
            <Image
              key={current.slug}
              src={current.image}
              alt={current.title}
              fill
              priority={slide === 0}
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.03]"
            />
            {/* scrim — taller than the category tiles because there's more type */}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent"
            />
            <div className="absolute inset-x-0 bottom-0 p-6 lg:p-10">
              <p className="eyebrow mb-3 text-bronze">{current.category}</p>
              <h1 className="text-[1.75rem] sm:text-[2.4rem] lg:text-[3.25rem] leading-[1.05] text-cream max-w-2xl">
                <AccentTitle title={current.title} />
              </h1>
              <p className="mt-4 text-[14px] lg:text-[15px] text-cream/75 leading-relaxed max-w-lg hidden sm:block">
                {current.excerpt}
              </p>
              <span className="mt-6 inline-flex items-center gap-2.5 border-b border-cream/40 pb-1 text-nav font-medium text-cream group-hover:border-bronze group-hover:text-bronze transition-colors">
                Read Full Review <ArrowRight size={14} />
              </span>
            </div>
          </Link>

          {/* carousel controls — moved out of the image so they clear the type */}
          {total > 1 && (
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSlide((s) => (s - 1 + total) % total)}
              aria-label="Previous slide"
              className="w-9 h-9 grid place-items-center border border-line text-ink hover:bg-ink hover:text-cream hover:border-ink transition-colors"
            >
              <ArrowLeft size={14} />
            </button>
            <span className="font-serif text-[13px] text-muted tabular-nums">
              0{slide + 1} <span className="text-line">/</span> 0{total}
            </span>
            <button
              type="button"
              onClick={() => setSlide((s) => (s + 1) % total)}
              aria-label="Next slide"
              className="w-9 h-9 grid place-items-center border border-line text-ink hover:bg-ink hover:text-cream hover:border-ink transition-colors"
            >
              <ArrowRight size={14} />
            </button>
          </div>
          )}
        </div>

        {/* ── right: trending now ─────────────────────────────────────── */}
        <aside className="w-full lg:w-[320px] xl:w-[340px] shrink-0">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="eyebrow">Trending Now</h2>
            <span aria-hidden className="flex-1 h-px bg-line" />
          </div>

          <div className="divide-y divide-line-soft">
            {trending.map((post, i) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="flex gap-4 group py-4 first:pt-0"
              >
                <span className="font-serif text-[15px] text-bronze/70 shrink-0 tabular-nums pt-0.5">
                  0{i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-[15px] leading-snug line-clamp-2 group-hover:text-bronze transition-colors">
                    {post.title}
                  </p>
                  <p className="mt-1.5 text-[10.5px] tracking-[0.14em] uppercase text-muted">
                    {post.date}
                  </p>
                </div>
                <div className="relative w-[72px] h-[72px] shrink-0 overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="72px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
