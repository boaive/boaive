import type { MetadataRoute } from "next";
import { orderedProjects } from "@/data/projects";
import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: site.url, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/work`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    ...orderedProjects.map((project) => ({
      url: `${site.url}/work/${project.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: project.kind === "client" ? 0.8 : 0.6,
      images: [`${site.url}${project.media.poster.src}`],
    })),
  ];
}
