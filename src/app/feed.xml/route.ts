import { absoluteUrl, siteName, siteUrl } from "@/lib/config";
import { getAllPosts } from "@/lib/data";

/**
 * RSS 2.0 feed at /feed.xml.
 *
 * Content sites get discovered through readers and aggregators, not just search.
 * Built from the same 60s revalidate cadence as the listing pages.
 */
export const revalidate = 60;

const DESCRIPTION =
  "Honest reviews, curated deals, and expert buying guides to help you shop smarter.";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(): Promise<Response> {
  // A DB outage should serve an empty-but-valid feed rather than a 500 that
  // readers cache as a dead endpoint — same reasoning as sitemap.ts.
  let posts: Awaited<ReturnType<typeof getAllPosts>>["posts"] = [];
  try {
    ({ posts } = await getAllPosts(50));
  } catch (err) {
    console.error("[feed] DB read failed; serving an empty feed", err);
  }

  const items = posts
    .map((p) => {
      const url = absoluteUrl(`/blog/${p.slug}`);
      // `date` is already a display string ("May 20, 2025"); Date parses it, and
      // an unparseable value is simply omitted rather than emitting "Invalid Date".
      const parsed = new Date(p.date);
      const pubDate = Number.isNaN(parsed.getTime())
        ? ""
        : `\n      <pubDate>${parsed.toUTCString()}</pubDate>`;
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>${pubDate}
      <description>${escapeXml(p.excerpt ?? "")}</description>
      <category>${escapeXml(p.category)}</category>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(DESCRIPTION)}</description>
    <language>en-IN</language>
    <atom:link href="${absoluteUrl("/feed.xml")}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
