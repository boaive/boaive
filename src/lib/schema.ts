import { site } from "@/content/site";
import { capabilities } from "@/data/capabilities";
import type { Project } from "@/data/types";

/**
 * schema.org builders. Every node links back to one Organization by @id,
 * so search engines see a single Boaive entity across all pages.
 */

type Node = Record<string, unknown>;

export const ORG_ID = `${site.url}/#organization`;
export const WEBSITE_ID = `${site.url}/#website`;

const abs = (path: string) => (path.startsWith("http") ? path : `${site.url}${path}`);
const phone = site.contact.phone.display.replace(/\s/g, "");

const areaServed = site.location.areaServed.map((name) =>
  name === site.location.countryName ? { "@type": "Country", name } : { "@type": "City", name },
);

export function organization(): Node {
  return {
    "@type": "ProfessionalService",
    "@id": ORG_ID,
    name: site.name,
    alternateName: `${site.name} Studio`,
    slogan: site.tagline,
    description: `${site.name} is a ${site.category.toLowerCase()} based in ${site.location.locality}, ${site.location.region}. ${site.seo.description}`,
    url: site.url,
    logo: { "@type": "ImageObject", url: abs("/brand/icon-512.png"), width: 512, height: 512 },
    image: abs("/opengraph-image.jpg"),
    email: site.contact.email,
    telephone: phone,
    // Service-area business: locality only, no street address.
    address: {
      "@type": "PostalAddress",
      addressLocality: site.location.locality,
      addressRegion: site.location.region,
      addressCountry: site.location.country,
    },
    areaServed,
    sameAs: [site.contact.instagram.url],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: phone,
      email: site.contact.email,
      areaServed: site.location.country,
      availableLanguage: ["English"],
    },
    knowsAbout: [
      "Website design",
      "Web development",
      "Creative website design",
      "3D website design",
      "Three.js",
      "WebGL",
      "Storytelling websites",
      "Animated websites",
      ...capabilities.flatMap((c) => c.items),
    ],
  };
}

export function website(): Node {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: site.url,
    name: site.name,
    description: site.seo.description,
    publisher: { "@id": ORG_ID },
    inLanguage: "en-IN",
  };
}

export function breadcrumbs(items: { name: string; path: string }[]): Node {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}

export function webPage(path: string, name: string, description: string): Node {
  return {
    "@type": "WebPage",
    "@id": `${abs(path)}#webpage`,
    url: abs(path),
    name,
    description,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORG_ID },
    inLanguage: "en-IN",
  };
}

export function creativeWork(project: Project): Node {
  return {
    "@type": "CreativeWork",
    "@id": `${abs(`/work/${project.slug}`)}#work`,
    name: project.title,
    headline: `${project.title} — ${project.type}`,
    description: project.summary,
    url: abs(`/work/${project.slug}`),
    image: abs(project.media.poster.src),
    genre: project.type,
    about: project.industry,
    keywords: project.technologies.join(", "),
    creator: { "@id": ORG_ID },
    ...(project.year ? { dateCreated: project.year } : null),
    ...(project.url ? { sameAs: project.url } : null),
  };
}

export function graph(...nodes: (Node | null | undefined)[]): Node {
  return { "@context": "https://schema.org", "@graph": nodes.filter(Boolean) };
}
