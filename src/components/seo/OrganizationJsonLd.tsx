import { capabilities } from "@/data/capabilities";
import { clientProjects } from "@/data/projects";
import { site } from "@/content/site";

/** Structured data describing the studio (schema.org ProfessionalService). */
export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${site.url}/#organization`,
    name: site.name,
    slogan: site.tagline,
    description: site.seo.description,
    url: site.url,
    logo: `${site.url}/brand/icon-512.png`,
    image: `${site.url}/opengraph-image.jpg`,
    email: site.contact.email,
    telephone: site.contact.phone.display.replace(/\s/g, ""),
    sameAs: [site.contact.instagram.url],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        telephone: site.contact.phone.display.replace(/\s/g, ""),
        email: site.contact.email,
        availableLanguage: ["English"],
      },
    ],
    knowsAbout: capabilities.flatMap((c) => c.items),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "What we build",
      itemListElement: capabilities.map((c) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: c.name, description: c.description },
      })),
    },
    subjectOf: clientProjects
      .filter((p) => p.url)
      .map((p) => ({ "@type": "CreativeWork", name: p.title, url: `${site.url}/work/${p.slug}` })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
