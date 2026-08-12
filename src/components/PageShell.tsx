import type { ReactNode } from "react";
import Link from "next/link";
import AnnouncementBar from "@/components/AnnouncementBar";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Newsletter from "@/components/Newsletter";
import { Swash } from "@/components/icons";
import { getCategories } from "@/lib/data";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

/**
 * Chrome shared by every non-home page: announcement strip, header (which needs
 * the live category list), breadcrumbs, a title block, then the page body,
 * newsletter band and footer.
 *
 * `width="prose"` gives the narrow measure legal/about copy wants;
 * `width="wide"` gives the full grid used by index pages.
 */
export default async function PageShell({
  title,
  eyebrow,
  intro,
  breadcrumb,
  path,
  width = "wide",
  children,
}: {
  title: string;
  eyebrow?: string;
  intro?: string;
  /** Trailing crumb label; "Home" is always prepended. */
  breadcrumb?: string;
  /**
   * Site-relative path of this page. Supplying it emits `BreadcrumbList` schema
   * matching the visible trail; omit it and only the HTML trail renders.
   */
  path?: string;
  width?: "prose" | "wide";
  children?: ReactNode;
}) {
  const categories = await getCategories();
  const crumb = breadcrumb ?? title;

  return (
    <>
      {path && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdScript(breadcrumbJsonLd([{ name: crumb, path }])),
          }}
        />
      )}
      <AnnouncementBar />
      <Header categories={categories} />

      <main className="flex-1">
        <section className="mx-auto max-w-page px-5 lg:px-8 pt-8 pb-12 lg:pb-16">
          <nav aria-label="Breadcrumb" className="text-[12.5px] text-muted mb-6">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-bronze transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden>›</li>
              <li className="text-body">{crumb}</li>
            </ol>
          </nav>

          <div className={width === "prose" ? "max-w-2xl" : undefined}>
            {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
            <h1 className="text-[2rem] sm:text-[2.6rem] lg:text-[3rem] leading-[1.08]">
              {title}
            </h1>
            <Swash className="mt-3 w-40 h-3 text-bronze opacity-60" />
            {intro && (
              <p className="mt-5 text-[15px] lg:text-[16px] text-body leading-relaxed">
                {intro}
              </p>
            )}
          </div>

          <div className={width === "prose" ? "max-w-2xl" : undefined}>
            {children}
          </div>
        </section>

        <Newsletter />
      </main>

      <Footer />
    </>
  );
}
