import { capabilities } from "@/data/capabilities";
import { orderedProjects } from "@/data/projects";
import { site } from "@/content/site";
import { graph, organization, webPage, website } from "@/lib/schema";
import { JsonLd } from "./JsonLd";

/** Home page structured data: the Boaive entity, the website, and what the studio offers. */
export function OrganizationJsonLd() {
  const org = {
    ...organization(),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "What we build",
      itemListElement: capabilities.map((c) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: c.name, description: c.description },
      })),
    },
    subjectOf: orderedProjects.map((p) => ({ "@type": "CreativeWork", name: p.title, url: `${site.url}/work/${p.slug}` })),
  };

  return <JsonLd data={graph(org, website(), webPage("/", site.seo.title, site.seo.description))} />;
}
