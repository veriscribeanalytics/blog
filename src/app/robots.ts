import type { MetadataRoute } from "next";
import { absoluteUrl, siteUrl } from "@/lib/config";

/**
 * Crawler rules. `/api/` is disallowed — those routes return JSON that would
 * otherwise be indexed as thin duplicate content alongside the real pages.
 *
 * When NEXT_PUBLIC_SITE_URL is unset we're on localhost or an unconfigured
 * preview, so block everything rather than risk a staging deploy competing
 * with production in the index.
 */
export default function robots(): MetadataRoute.Robots {
  const isConfigured = Boolean(process.env.NEXT_PUBLIC_SITE_URL);

  if (!isConfigured || siteUrl.includes("localhost")) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteUrl,
  };
}
