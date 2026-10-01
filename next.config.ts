import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The free Vercel URL permanently redirects to the real domain (keeps one canonical site for SEO).
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "boaive.vercel.app" }],
        destination: "https://boaive.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
