import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
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
