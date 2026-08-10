import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { getCategories } from "@/lib/data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "All Categories",
  description: "Browse reviews and guides by category.",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <PageShell
      title="All Categories"
      eyebrow="Browse"
      intro="Find reviews, guides, and deals organized by category."
    >
      <div className="mt-10 grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10 lg:gap-x-8 lg:gap-y-14">
        {categories.map((c) => (
          <Link key={c.slug} href={`/category/${c.slug}`} className="group">
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image
                src={c.image}
                alt={c.name}
                fill
                sizes="(max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
              />
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink/70 to-transparent opacity-90"
              />
              <div className="absolute inset-x-0 bottom-0 p-5 lg:p-6">
                <h2 className="font-serif text-[19px] lg:text-[22px] text-cream leading-tight">
                  {c.name}
                </h2>
                <p className="mt-1 text-[11px] tracking-[0.14em] uppercase text-cream/70">
                  {c.count}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
