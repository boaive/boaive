import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  // Preview deployments: crawlable, so Google can read their noindex header (next.config.ts)
  // and drop them. A Disallow here would hide the noindex and can leave them listed.
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
    return { rules: { userAgent: "*", allow: "/" } };
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Developer switches (?debug, ?quality=…, ?dpr=…, ?3d=off) are the same page; keep them out of search.
      disallow: ["/*?*debug", "/*?*quality=", "/*?*dpr=", "/*?*3d="],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
