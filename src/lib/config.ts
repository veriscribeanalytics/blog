/**
 * DB-free static site config + shared types.
 *
 * Client Components import from here (and from `./types`) so the Node-only `pg`
 * chain in `./db.ts` is never pulled into the browser bundle. Server code that
 * reads the database lives in `./data.ts` (which re-exports this module).
 */

export type TrustPoint = {
  /** key into the icon map in TrustStrip.tsx */
  icon: "headphones" | "zap" | "shield" | "tag";
  label: string;
};

/** Public site name — used in metadata titles and JSON-LD `publisher`. */
export const siteName = "AffiliBlog";

/**
 * Absolute origin of the deployed site, no trailing slash.
 *
 * Required for correct SEO output: `metadataBase` resolves relative OG image
 * URLs against it, and sitemap/robots/JSON-LD all emit absolute URLs. Set
 * NEXT_PUBLIC_SITE_URL in the deployment environment. The localhost fallback
 * keeps dev working but must not be what production ships.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path = "/"): string {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export const navLinks = [
  { label: "Deals", href: "/deals" },
  { label: "Reviews", href: "/reviews" },
  { label: "Guides", href: "/guides" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/** Thin strip pinned above the header on every page. */
export const announcement = "Curated Buying Guides for Smarter Choices";

/** Four-up credibility row that sits directly under the post hero. */
export const trustPoints: TrustPoint[] = [
  { icon: "headphones", label: "Hands-on, real-world tested" },
  { icon: "zap", label: "Honest verdicts, no hype" },
  { icon: "shield", label: "Best picks for every budget" },
  { icon: "tag", label: "Always kept up to date" },
];

/** Tagline set in the script face at the end of the newsletter band. */
export const newsletterTagline = "Smarter. Buying. Better. Life.";

/** Quiet editorial pause between the home-page grids (see Manifesto.tsx). */
export const manifesto = {
  eyebrow: "Our Promise",
  statement:
    "We only recommend what we would buy ourselves — tested, lived with, and judged honestly.",
  accent: "tested, lived with, and judged honestly",
};
