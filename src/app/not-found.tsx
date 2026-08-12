import Link from "next/link";
import AnnouncementBar from "@/components/AnnouncementBar";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Swash } from "@/components/icons";
import { getCategories } from "@/lib/data";

/**
 * 404. Without this Next serves its bare default — no header, no footer, no way
 * out — which is a dead end for both readers and crawlers following a stale link.
 *
 * Async so it can render the real header (which needs the live category list),
 * giving a 404 the same navigation as any other page.
 */
export default async function NotFound() {
  const categories = await getCategories();

  return (
    <>
      <AnnouncementBar />
      <Header categories={categories} />

      <main className="flex-1">
        <section className="mx-auto max-w-page px-5 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="max-w-2xl">
            <p className="eyebrow mb-2">404</p>
            <h1 className="text-[2rem] sm:text-[2.6rem] lg:text-[3rem] leading-[1.08]">
              We couldn&rsquo;t find that page
            </h1>
            <Swash className="mt-3 w-40 h-3 text-bronze opacity-60" />
            <p className="mt-5 text-[15px] lg:text-[16px] text-body leading-relaxed">
              The link may be broken, or the article may have moved. Here&rsquo;s
              where to pick things back up.
            </p>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[14px]">
              {[
                { href: "/blog", label: "All articles" },
                { href: "/reviews", label: "Reviews" },
                { href: "/guides", label: "Buying guides" },
                { href: "/deals", label: "Current deals" },
                { href: "/categories", label: "Browse categories" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-body underline decoration-line hover:text-bronze transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href="/"
              className="mt-10 inline-flex items-center gap-2 bg-ink text-cream text-[13px] font-semibold px-7 py-3 hover:bg-olive transition-colors"
            >
              Back to the homepage
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
