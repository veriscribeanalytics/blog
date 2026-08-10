import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AnnouncementBar from "@/components/AnnouncementBar";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Newsletter from "@/components/Newsletter";
import PostSidebar from "@/components/PostSidebar";
import ProductCard from "@/components/ProductCard";
import TrustStrip from "@/components/TrustStrip";
import { ChevronRight, Swash } from "@/components/icons";
import { getCategories, getPostBySlug } from "@/lib/data";
import { jsonLdScript, postJsonLd } from "@/lib/jsonld";

export const revalidate = 60;

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return { title: "Not found", robots: { index: false, follow: false } };
  }
  const url = `/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url,
      publishedTime: post.publishedAt || undefined,
      authors: post.authorName ? [post.authorName] : undefined,
      section: post.category || undefined,
      images: post.heroImage ? [{ url: post.heroImage, alt: post.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.heroImage ? [post.heroImage] : undefined,
    },
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const [post, categories] = await Promise.all([
    getPostBySlug(slug),
    getCategories(),
  ]);
  if (!post) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(postJsonLd(post)) }}
      />
      <AnnouncementBar />
      <Header categories={categories} />

      <main className="flex-1">
        {/* ── post hero ───────────────────────────────────────────── */}
        <div className="bg-paper border-b border-line">
          <div className="mx-auto max-w-[1400px] px-5 lg:px-8 pt-6 pb-8 lg:pb-10">
            {/* breadcrumbs */}
            <nav aria-label="Breadcrumb" className="text-[12.5px] text-muted mb-6">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="hover:text-bronze transition-colors">
                    Home
                  </Link>
                </li>
                <li aria-hidden>›</li>
                <li>
                  <Link
                    href={`/category/${post.categorySlug}`}
                    className="hover:text-bronze transition-colors"
                  >
                    {post.category}
                  </Link>
                </li>
                <li aria-hidden>›</li>
                <li className="text-body truncate max-w-[60vw] sm:max-w-none">
                  {post.title}
                </li>
              </ol>
            </nav>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* left: text column */}
              <div className="flex-1">
                <p className="eyebrow-chip mb-4">{post.category}</p>
                <h1 className="text-[2rem] sm:text-[2.6rem] lg:text-[3rem] leading-[1.08] max-w-2xl">
                  {post.title}
                </h1>
                <Swash className="mt-3 w-40 h-3 text-bronze opacity-60" />
                <p className="mt-5 text-[15px] lg:text-[16px] text-body leading-relaxed max-w-xl">
                  {post.excerpt}
                </p>

                {/* byline */}
                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <div className="flex items-center gap-2.5">
                    {post.authorAvatar ? (
                      <Image
                        src={post.authorAvatar}
                        alt={post.authorName}
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <span className="h-9 w-9 rounded-full bg-band grid place-items-center text-[11px] font-semibold text-bronze-deep">
                        {initials(post.authorName)}
                      </span>
                    )}
                    <span className="text-[13px] text-body">
                      By{" "}
                      <span className="text-ink font-medium">
                        {post.authorName}
                      </span>
                    </span>
                  </div>
                  <span className="text-[12.5px] text-muted">
                    {post.date} &nbsp;·&nbsp; {post.readTime}
                  </span>
                </div>
              </div>

              {/* right: hero image */}
              <div className="relative w-full lg:w-[480px] xl:w-[560px] shrink-0 aspect-[4/3] overflow-hidden">
                <Image
                  src={post.heroImage}
                  alt={post.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 560px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        <TrustStrip />

        <div className="mx-auto max-w-[1400px] px-5 lg:px-8 pt-8 pb-12">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* ── article column ───────────────────────────────────── */}
            <article className="flex-1 min-w-0">
              {/* affiliate disclosure */}
              <p className="text-[12px] text-muted italic border-l-2 border-bronze pl-3 max-w-2xl">
                We may earn a commission from links on this page — at no extra
                cost to you. This never affects our rankings.
              </p>

              {/* "In This Article" box */}
              {post.inThisArticle.length > 0 && (
                <div className="mt-8 bg-sand border border-line p-6 max-w-2xl">
                  <div className="relative inline-block">
                    <p className="text-[14px] font-semibold mb-1">
                      In This Article
                    </p>
                    <Swash className="absolute -bottom-0.5 left-0 w-24 h-2.5 text-bronze opacity-50" />
                  </div>
                  <ul className="mt-5 grid sm:grid-cols-2 gap-x-8 gap-y-2.5">
                    {post.inThisArticle.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-[13px] text-body"
                      >
                        <ChevronRight
                          size={14}
                          className="text-bronze mt-0.5 shrink-0"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* article body — agent-supplied HTML */}
              <div
                className="post-body mt-8 max-w-2xl"
                dangerouslySetInnerHTML={{ __html: post.body }}
              />

              {/* pull quote */}
              {post.pullQuote && (
                <div className="mt-10 max-w-2xl">
                  <blockquote className="relative bg-sand border-l-4 border-bronze px-6 py-5">
                    <span
                      className="absolute -top-2 left-4 text-[48px] font-serif text-bronze leading-none"
                      aria-hidden
                    >
                      &ldquo;
                    </span>
                    <p
                      className="text-[17px] leading-relaxed text-ink italic"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {post.pullQuote}
                    </p>
                    <span
                      className="absolute -bottom-4 right-4 text-[48px] font-serif text-bronze leading-none"
                      aria-hidden
                    >
                      &rdquo;
                    </span>
                  </blockquote>
                </div>
              )}

              {/* ── top picks (structured products) ─────────────────── */}
              {post.products.length > 0 && (
                <section id="top-5" className="mt-12 scroll-mt-28">
                  <div className="flex items-end justify-between gap-4 mb-1">
                    <h2 className="text-[26px] lg:text-[30px] leading-tight">
                      Top {post.products.length} Best Picks
                    </h2>
                    {post.products.length > 1 && (
                      <a
                        href="#comparison"
                        className="hidden lg:inline-flex items-center gap-1.5 text-[13px] text-bronze hover:text-bronze-deep transition-colors mb-1"
                      >
                        View Comparison <ChevronRight size={14} />
                      </a>
                    )}
                  </div>
                  <Swash className="w-32 h-2.5 text-bronze opacity-50" />
                  <div className="mt-6 space-y-6">
                    {post.products.map((p) => (
                      <ProductCard key={p.rank} p={p} />
                    ))}
                  </div>
                </section>
              )}

              {/* ── comparison table (structured) ───────────────────── */}
              {post.products.length > 1 && (
                <section id="comparison" className="mt-10 scroll-mt-28">
                  <h2 className="text-[22px] lg:text-[26px]">Comparison Table</h2>
                  <div className="mt-5 overflow-x-auto hide-scrollbar border border-line">
                    <table className="w-full min-w-[560px] text-left">
                      <thead className="bg-sand">
                        <tr className="text-[12px] uppercase tracking-wider text-muted">
                          <th className="px-4 py-3 font-semibold">Model</th>
                          <th className="px-4 py-3 font-semibold">Rating</th>
                          <th className="px-4 py-3 font-semibold">Highlights</th>
                          <th className="px-4 py-3 font-semibold">Price</th>
                        </tr>
                      </thead>
                      <tbody className="bg-paper">
                        {post.products.map((p, i) => (
                          <tr
                            key={p.rank}
                            className={i > 0 ? "border-t border-line-soft" : ""}
                          >
                            <td className="px-4 py-3.5 text-[13.5px] font-medium">
                              {p.name}
                            </td>
                            <td className="px-4 py-3.5 text-[13.5px] text-body">
                              {p.rating} / 5
                            </td>
                            <td className="px-4 py-3.5 text-[13.5px] text-body">
                              {p.pros[1] ?? p.pros[0] ?? ""}
                            </td>
                            <td className="px-4 py-3.5 text-[13.5px] font-semibold">
                              {p.price}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* ── FAQs (structured) ───────────────────────────────── */}
              {post.faqs && post.faqs.length > 0 && (
                <section id="faqs" className="mt-10 scroll-mt-28 max-w-2xl">
                  <h2 className="text-[22px] lg:text-[26px]">FAQs</h2>
                  <div className="mt-5 space-y-4">
                    {post.faqs.map(({ q, a }) => (
                      <details
                        key={q}
                        className="group border border-line bg-paper px-4 py-3.5"
                      >
                        <summary className="cursor-pointer list-none text-[14px] font-medium flex items-center justify-between gap-4">
                          {q}
                          <span className="text-bronze shrink-0 transition-transform group-open:rotate-45">
                            +
                          </span>
                        </summary>
                        <p className="mt-2.5 text-[13.5px] leading-relaxed text-body">
                          {a}
                        </p>
                      </details>
                    ))}
                  </div>
                </section>
              )}
            </article>

            {/* ── sidebar ──────────────────────────────────────────── */}
            <PostSidebar
              products={post.products}
              relatedArticles={post.relatedArticles}
              tableOfContents={post.tableOfContents}
            />
          </div>
        </div>

        <Newsletter />
      </main>

      <Footer />
    </>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
