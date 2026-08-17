import type { Metadata } from "next";
import { Dancing_Script, Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import {
  absoluteUrl,
  adsEnabled,
  adsensePublisherId,
  ogImage,
  siteName,
  siteUrl,
} from "@/lib/config";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  // Italic is real: the post pull quote and `.headline-accent` both use it.
  style: ["normal", "italic"],
  display: "swap",
});

// Only used for the newsletter tagline — "Smarter. Buying. Better. Life." — which
// lives inside a `hidden lg:block` band. `preload: false` keeps the design while
// stopping every mobile visitor from fetching a font they can never see; the
// browser still loads it on demand for the desktop layout.
const dancing = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const title = `${siteName} — Reviews, Deals & Buying Guides`;
const description =
  "Honest reviews, curated deals, and expert buying guides to help you shop smarter.";

export const metadata: Metadata = {
  // Resolves every relative OG/canonical URL below against the real origin.
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    // Child pages set just their own title; the suffix is appended here.
    template: `%s — ${siteName}`,
  },
  description,
  applicationName: siteName,
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": [{ url: "/feed.xml", title: siteName }] },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    siteName,
    title,
    description,
    url: "/",
    // en-IN: every price on the site is INR and the audience is India.
    locale: "en_IN",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImage.url],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Organization + WebSite. No `potentialAction`/SearchAction: the header search
  // button is not wired to anything, and advertising a search endpoint that
  // doesn't exist is exactly the kind of thing Google penalises.
  const orgLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": absoluteUrl("/#organization"),
        name: siteName,
        url: absoluteUrl("/"),
        // The generated OG card doubles as the publisher logo — it's the only
        // brand image that exists, and an Organization with no logo is a weak
        // E-E-A-T signal for a product-review site.
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/opengraph-image"),
          width: 1200,
          height: 630,
        },
        description,
      },
      {
        "@type": "WebSite",
        "@id": absoluteUrl("/#website"),
        name: siteName,
        url: absoluteUrl("/"),
        description,
        publisher: { "@id": absoluteUrl("/#organization") },
        inLanguage: "en-IN",
      },
    ],
  };

  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${dancing.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
        />
        {/*
          AdSense loader. `afterInteractive` (the default), not
          `beforeInteractive`: the docs reserve that for genuinely critical
          scripts like bot detectors and consent managers, and fetching an ad
          script ahead of first-party code would trade LCP — a ranking factor on
          a site whose revenue depends on organic search — for nothing.

          No ad units are placed yet; this only registers the site with the
          account. When units are added, give each a reserved height so it
          cannot shift content in, and keep them away from the buy controls
          (ProductCard / TopPickCard / StickyBuyBar) — an ad click there is a
          reader who left instead of converting on a commission.
        */}
        {adsEnabled && (
          <Script
            id="adsbygoogle-loader"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsensePublisherId}`}
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        )}
        {children}
      </body>
    </html>
  );
}
