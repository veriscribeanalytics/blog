import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    /**
     * Next emits one srcset candidate per entry here for every `fill` image, so
     * the ladder's length is multiplied by the image count on a page — /deals
     * renders 24 thumbnails and was shipping 9 candidates each.
     *
     * The widest image slot on the site is the home hero at 60vw (~840px inside
     * the 1400px shell), so 1920 already covers it at 2x. 2048 and 3840 were
     * never selectable by any layout here and cost bytes on every page.
     */
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // Hosts the agent may send image URLs from. Anything not listed here is
    // rejected by the next/image optimizer (400) and the image won't render.
    // Add your own bucket/CDN host when one is provisioned.
    remotePatterns: [
      // Seed/demo art only — hotlinked, rate-limitable. Not for real content.
      { protocol: "https", hostname: "images.unsplash.com" },
      // Managed image CDNs — the agent can use any of these today.
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**.imgix.net" },
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "**.s3.amazonaws.com" },
      { protocol: "https", hostname: "**.s3.*.amazonaws.com" },
      // Amazon product imagery (for product cards pulled from listings).
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "images-na.ssl-images-amazon.com" },
    ],
  },
};

export default nextConfig;
