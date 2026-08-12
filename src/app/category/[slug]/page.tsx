import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AnnouncementBar from "@/components/AnnouncementBar";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Newsletter from "@/components/Newsletter";
import PostGrid from "@/components/PostGrid";
import {
  getCategories,
  getCategoryPosts,
  getCategorySitemapEntries,
  ogImage,
} from "@/lib/data";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

export const revalidate = 60;

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) {
    return {
      title: "Category not found",
      robots: { index: false, follow: false },
      // Without this the root layout's `canonical: "/"` is inherited, pointing
      // a missing category at the homepage.
      alternates: { canonical: `/category/${slug}` },
    };
  }
  const { posts } = await getCategoryPosts(slug);
  const description = `Reviews, guides and deals in ${cat.name}.`;
  const url = `/category/${cat.slug}`;
  return {
    title: cat.name,
    description,
    alternates: { canonical: url },
    // A category with no posts is a thin page and a soft-404 candidate. It stays
    // reachable (the nav links every category) but must not be indexed.
    robots: posts.length === 0 ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      title: cat.name,
      description,
      url,
      // Category art is a hotlinked Unsplash URL; fall back to the site card so
      // a share never ends up with no image at all.
      images: cat.image ? [{ url: cat.image, alt: cat.name }] : [ogImage],
    },
  };
}

/**
 * Prerender every category that has posts. Without this each category page is a
 * cold render on first request after every revalidate window.
 */
export async function generateStaticParams(): Promise<Params[]> {
  const entries = await getCategorySitemapEntries();
  return entries.map((e) => ({ slug: e.slug }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const categories = await getCategories();
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) notFound();

  const { posts } = await getCategoryPosts(slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            breadcrumbJsonLd([
              { name: cat.name, path: `/category/${cat.slug}` },
            ]),
          ),
        }}
      />
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
              <li className="text-body">{cat.name}</li>
            </ol>
          </nav>

          <p className="eyebrow mb-2">Category</p>
          <h1 className="text-[2rem] sm:text-[2.6rem] lg:text-[3rem] leading-[1.08]">
            {cat.name}
          </h1>
          <p className="mt-3 text-[14px] text-muted">{cat.count}</p>

          <PostGrid
            posts={posts}
            empty="No articles in this category yet — check back soon."
          />
        </section>
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
