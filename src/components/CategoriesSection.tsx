import Image from "next/image";
import Link from "next/link";
import { getCategories } from "@/lib/data";
import { ArrowRight } from "./icons";

/**
 * Editorial category tiles — 3-up on desktop, 2-up mobile, tall 3:4 crops with
 * the label set over the image. Fewer, larger tiles per the magazine reference;
 * the row is deliberately not 6-up.
 */
export default async function CategoriesSection() {
  const categories = await getCategories();
  return (
    <section className="border-t border-line-soft">
      <div className="mx-auto max-w-page px-5 lg:px-8 py-16 lg:py-24">
        <div className="flex items-end justify-between mb-10 lg:mb-12">
          <div>
            <p className="eyebrow mb-2">Browse</p>
            <h2 className="section-title">Popular Categories</h2>
          </div>
          <Link
            href="/categories"
            className="hidden sm:inline-flex items-center gap-2 text-nav text-body hover:text-bronze transition-colors"
          >
            View all categories <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10 lg:gap-x-8 lg:gap-y-14">
          {categories.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`} className="group">
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  sizes="(max-width: 1024px) 50vw, 440px"
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                />
                {/* scrim keeps the label legible on light photography */}
                <div
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink/70 to-transparent opacity-90"
                />
                <div className="absolute inset-x-0 bottom-0 p-5 lg:p-6">
                  <h3 className="font-serif text-[19px] lg:text-[22px] text-cream leading-tight">
                    {c.name}
                  </h3>
                  <p className="mt-1 text-[11px] tracking-[0.14em] uppercase text-cream/70">
                    {c.count}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/categories"
          className="sm:hidden mt-7 inline-flex items-center gap-2 text-nav text-body"
        >
          View all categories <ArrowRight size={13} />
        </Link>
      </div>
    </section>
  );
}
