import type { Metadata } from "next";
import { Dancing_Script, Inter, Playfair_Display } from "next/font/google";
import { absoluteUrl, siteName, siteUrl } from "@/lib/config";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

// Only used for the newsletter tagline — "Smarter. Buying. Better. Life."
const dancing = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
  display: "swap",
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
  alternates: { canonical: "/" },
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
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title, description },
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
      },
      {
        "@type": "WebSite",
        "@id": absoluteUrl("/#website"),
        name: siteName,
        url: absoluteUrl("/"),
        description,
        publisher: { "@id": absoluteUrl("/#organization") },
        inLanguage: "en",
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
        {children}
      </body>
    </html>
  );
}
