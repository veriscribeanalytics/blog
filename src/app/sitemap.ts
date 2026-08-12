import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/config";
import { getCategorySitemapEntries, getPostSitemapEntries } from "@/lib/data";

/**
 * Crawl map for the whole site: static routes + every published post and
 * non-empty category, pulled from the DB.
 *
 * Revalidates on the same 60s cadence as the content pages so a freshly
 * published post becomes discoverable without a redeploy.
 */
export const revalidate = 60;

// Legal/utility pages are indexable but rarely change and carry little weight.
//
// `content: true` marks a listing whose freshness tracks the newest post — Google
// ignores `priority`/`changeFrequency` entirely but does read `lastmod`, and these
// are the highest-value URLs on the site, so leaving them with no `lastmod` at all
// wasted the one field that counts.
const STATIC_ROUTES: {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  content?: boolean;
}[] = [
  { path: "/", priority: 1, changeFrequency: "daily", content: true },
  { path: "/deals", priority: 0.9, changeFrequency: "daily", content: true },
  { path: "/reviews", priority: 0.9, changeFrequency: "daily", content: true },
  { path: "/guides", priority: 0.8, changeFrequency: "weekly", content: true },
  { path: "/blog", priority: 0.8, changeFrequency: "daily", content: true },
  { path: "/categories", priority: 0.6, changeFrequency: "weekly", content: true },
  { path: "/about", priority: 0.4, changeFrequency: "yearly" },
  { path: "/contact", priority: 0.4, changeFrequency: "yearly" },
  { path: "/editorial", priority: 0.3, changeFrequency: "yearly" },
  { path: "/disclosure", priority: 0.3, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
];

function lastModified(iso: string | null): Date | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntry = (
    r: (typeof STATIC_ROUTES)[number],
    freshest?: Date,
  ): MetadataRoute.Sitemap[number] => ({
    url: absoluteUrl(r.path),
    lastModified: r.content ? freshest : undefined,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  });

  // A DB outage must not take the sitemap down with it — serving the static
  // routes beats returning a 500 that Search Console records as a fetch error.
  let posts: { slug: string; updatedAt: string | null }[] = [];
  let categories: { slug: string; updatedAt: string | null }[] = [];
  try {
    [posts, categories] = await Promise.all([
      getPostSitemapEntries(),
      getCategorySitemapEntries(),
    ]);
  } catch (err) {
    console.error("[sitemap] DB read failed; serving static routes only", err);
    return STATIC_ROUTES.map((r) => staticEntry(r));
  }

  // listPostSitemapEntries already orders by COALESCE(updated_at, published_at)
  // DESC, so the first row is the freshest content on the site.
  const freshest = lastModified(posts[0]?.updatedAt ?? null);

  return [
    ...STATIC_ROUTES.map((r) => staticEntry(r, freshest)),
    ...categories.map((c) => ({
      url: absoluteUrl(`/category/${c.slug}`),
      lastModified: lastModified(c.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...posts.map((p) => ({
      url: absoluteUrl(`/blog/${p.slug}`),
      lastModified: lastModified(p.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
