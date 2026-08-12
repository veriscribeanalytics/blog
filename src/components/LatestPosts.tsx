import Image from "next/image";
import Link from "next/link";
import { getLatestPosts } from "@/lib/data";
import { ArrowRight } from "./icons";

export default async function LatestPosts() {
  const latestPosts = await getLatestPosts();
  return (
    <section className="border-t border-line-soft">
      <div className="mx-auto max-w-page px-5 lg:px-8 py-16 lg:py-24">
        <div className="flex items-end justify-between mb-10 lg:mb-12">
          <div>
            <p className="eyebrow mb-2">Fresh</p>
            <h2 className="section-title">Latest from the Blog</h2>
          </div>
          <Link
            href="/blog"
            className="hidden sm:inline-flex items-center gap-2 text-nav text-body hover:text-bronze transition-colors"
          >
            View all articles <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 lg:gap-x-10 lg:gap-y-16">
          {latestPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex flex-col">
              {/* portrait crop — the magazine proportion */}
              <div className="relative aspect-[4/5] overflow-hidden">
                {/* No `priority`: the hero carousel above is the LCP element. */}
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 440px"
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                />
                <span className="absolute top-4 left-4 bg-paper/95 backdrop-blur-sm text-[10px] font-semibold tracking-widest uppercase px-3 py-1.5">
                  {post.category}
                </span>
              </div>

              {/* text */}
              <div className="flex-1 pt-6">
                <h3 className="font-serif text-[21px] lg:text-[23px] leading-[1.25] group-hover:text-bronze transition-colors line-clamp-3">
                  {post.title}
                </h3>
                <p className="mt-3 text-[11px] tracking-[0.14em] uppercase text-muted">
                  {post.date} &nbsp;·&nbsp; {post.readTime}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/blog"
          className="sm:hidden mt-7 inline-flex items-center gap-2 text-nav text-body"
        >
          View all articles <ArrowRight size={13} />
        </Link>
      </div>
    </section>
  );
}
