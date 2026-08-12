import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/types";

/**
 * The standard post card grid — the same 3-up editorial layout the category
 * page uses, lifted here so /blog, /reviews and /guides share one implementation.
 */
export default function PostGrid({
  posts,
  empty = "No articles here yet — check back soon.",
}: {
  posts: Post[];
  empty?: string;
}) {
  if (posts.length === 0) {
    return <p className="mt-10 text-[15px] text-body">{empty}</p>;
  }

  return (
    <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 lg:gap-x-10 lg:gap-y-16">
      {posts.map((post, i) => (
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
              // First card is the LCP element on every listing page.
              priority={i === 0}
              // A 3-up grid inside a 1400px shell never renders a card wider
              // than ~440px, so cap the srcset there instead of letting 100vw
              // pull the full 3840w ladder into the HTML.
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 440px"
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
  );
}
