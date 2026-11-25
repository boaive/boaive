import type { NextConfig } from "next";
import { site } from "./src/content/site";

const isPreview = Boolean(process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production");
const noindex = [{ key: "X-Robots-Tag", value: "noindex" }];

const nextConfig: NextConfig = {
  async redirects() {
    const marketing = site.contact.marketingSite.url;
    return [
      // One canonical site for SEO: the free Vercel URL and www go to the real domain.
      {
        source: "/:path*",
        has: [{ type: "host", value: "boaive.vercel.app" }],
        destination: "https://boaive.com/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.boaive.com" }],
        destination: "https://boaive.com/:path*",
        permanent: true,
      },
      // The digital marketing page lives on its own website (set site.contact.marketingSite.url).
      ...(marketing
        ? ["/digital-marketing", "/marketing"].map((source) => ({ source, destination: marketing, permanent: false }))
        : []),
    ];
  },
  async headers() {
    return [
      // Preview deployments never show up in search.
      ...(isPreview ? [{ source: "/:path*", headers: noindex }] : []),
      // Files that are not pages: the Search Console check file and the web app manifest.
      { source: "/google180ca5d946a28036.html", headers: noindex },
      { source: "/manifest.webmanifest", headers: noindex },
    ];
  },
};

export default nextConfig;
