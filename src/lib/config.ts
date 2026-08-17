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

/**
 * Absolute URL for a site-relative path.
 *
 * Refuses to build a localhost URL in a production build. Without this the
 * fallback above fails *silently*: `metadataBase`, every canonical, every
 * sitemap `<loc>` and every JSON-LD `@id` quietly become
 * `http://localhost:3000` and the build still goes green.
 *
 * Throwing here rather than at module load is deliberate — `robots.ts` handles
 * the unset case itself (serving `Disallow: /`) and must stay importable, and
 * lint/type-generation never call this. `sitemap.ts` and `layout.tsx` do, so a
 * misconfigured production build fails loudly at the point it would have
 * emitted a wrong URL.
 */
export function absoluteUrl(path = "/"): string {
  if (
    process.env.NODE_ENV === "production" &&
    !process.env.NEXT_PUBLIC_SITE_URL
  ) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL is not set. A production build without it would " +
        "emit http://localhost:3000 as the canonical origin for every page. " +
        "Set it in the deployment environment (see DEPLOY.md) and redeploy.",
    );
  }
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Google AdSense publisher id, in the `ca-pub-…` form the loader script wants.
 *
 * `public/ads.txt` carries the same account as a bare `pub-…` id — that's what
 * the ads.txt spec expects. Keep the two in sync when the account changes.
 */
export const adsensePublisherId = "ca-pub-1773742947612254";

/**
 * Whether to load the third-party ad script.
 *
 * Requires a real production build *and* a configured non-localhost origin.
 *
 * The `NODE_ENV` half is load-bearing and not redundant: `.env.local` sets
 * NEXT_PUBLIC_SITE_URL to the live domain, so the origin checks alone are true
 * under `npm run dev` and every local page view would fetch live ads and count
 * toward the invalid-traffic signals that get AdSense accounts suspended.
 */
export const adsEnabled =
  process.env.NODE_ENV === "production" &&
  Boolean(process.env.NEXT_PUBLIC_SITE_URL) &&
  !siteUrl.includes("localhost");

/**
 * The generated social card at `src/app/opengraph-image.tsx`.
 *
 * File-based `opengraph-image` only applies to the segment it sits in — it is NOT
 * inherited by nested routes — and a page that declares its own `openGraph`
 * replaces the parent's object wholesale. So every page has to name the image
 * explicitly or it ships no `og:image` at all.
 */
export const ogImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${siteName} — honest reviews, curated deals, buying guides`,
};

/** `openGraph` block for a plain page: its own canonical URL plus the site card. */
export function pageOpenGraph(path: string) {
  return { url: path, images: [ogImage] };
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

/**
 * Four-up credibility row that sits directly under the post hero.
 *
 * These are public claims about method, so they have to stay true. Recommendations
 * are built from published specs, expert reviews, and verified-owner feedback —
 * not from hands-on lab testing. Don't reintroduce "tested"/"hands-on" wording
 * here unless the testing it asserts actually happens; `/editorial` states the
 * methodology plainly and these labels must not contradict it.
 */
export const trustPoints: TrustPoint[] = [
  { icon: "headphones", label: "Independently researched" },
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
    "We only recommend what we would buy ourselves — researched, cross-checked, and judged honestly.",
  accent: "researched, cross-checked, and judged honestly",
};
