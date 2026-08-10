import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import StarRating from "@/components/StarRating";
import { getDeals } from "@/lib/data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Deals",
  description: "Products we recommend that are currently below their usual price.",
  alternates: { canonical: "/deals" },
};

export default async function DealsPage() {
  const deals = await getDeals();

  return (
    <PageShell
      title="Current Deals"
      eyebrow="Save"
      intro="Products from our reviews that are currently selling below MRP — biggest discount first."
    >
      {deals.length === 0 ? (
        <p className="mt-10 text-[15px] text-body">
          No discounted products right now — check back soon.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {deals.map((d) => (
            <div
              key={d.amazonUrl}
              className="border border-line bg-paper flex flex-col"
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={d.image}
                  alt={d.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
                {d.discount && (
                  <span className="absolute top-4 left-4 bg-leaf text-cream text-[11px] font-semibold px-2.5 py-1">
                    {d.discount}
                  </span>
                )}
              </div>

              <div className="flex-1 flex flex-col p-5">
                <h2 className="text-[17px] leading-snug">{d.name}</h2>

                <div className="mt-2">
                  <StarRating rating={d.rating} reviews={d.reviews} />
                </div>

                <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-[21px] font-serif text-ink">{d.price}</span>
                  <span className="text-[14px] line-through text-muted">{d.mrp}</span>
                </div>

                {d.postSlug && (
                  <p className="mt-3 text-[12.5px] text-muted">
                    From{" "}
                    <Link
                      href={`/blog/${d.postSlug}`}
                      className="text-bronze hover:text-bronze-deep transition-colors"
                    >
                      {d.postTitle}
                    </Link>
                  </p>
                )}

                <a
                  href={d.amazonUrl}
                  target="_blank"
                  rel="nofollow sponsored noopener"
                  className="mt-5 inline-flex items-center justify-center gap-2 bg-ink text-cream text-[13px] font-semibold px-6 py-2.5 hover:bg-olive transition-colors"
                >
                  View on Amazon →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
