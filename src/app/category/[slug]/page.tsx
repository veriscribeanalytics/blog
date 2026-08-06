import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AnnouncementBar from "@/components/AnnouncementBar";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Newsletter from "@/components/Newsletter";
import { getCategories, getCategoryPosts } from "@/lib/data";

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
  if (!cat) return { title: "Category not found — AffiliBlog" };
  return {
    title: `${cat.name} — AffiliBlog`,
    description: `Reviews, guides and deals in ${cat.name}.`,
  };
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

          {posts.length === 0 ? (
            <p className="mt-10 text-[15px] text-body">
              No articles in this category yet — check back soon.
            </p>
          ) : (
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 lg:gap-x-10 lg:gap-y-16">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                    />
                    <span className="absolute top-4 left-4 bg-paper/95 backdrop-blur-sm text-[10px] font-semibold tracking-widest uppercase px-3 py-1.5">
                      {post.category}
                    </span>
                  </div>
                  <div className="flex-1 pt-6">
                    <h2 className="font-serif text-[21px] lg:text-[23px] leading-[1.25] group-hover:text-bronze transition-colors line-clamp-3">
                      {post.title}
                    </h2>
                    <p className="mt-3 text-[11px] tracking-[0.14em] uppercase text-muted">
                      {post.date} &nbsp;·&nbsp; {post.readTime}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
