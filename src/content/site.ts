import type { ChapterId } from "@/story/chapters";

/**
 * Site-wide configuration: brand, contact channels, navigation and SEO defaults.
 * Contact details are the studio's public details (as used on the Boaive sample sites).
 */

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  // Canonical production domain (the Vercel URL redirects here, see next.config.ts).
  if (process.env.NODE_ENV === "production") return "https://boaive.com";
  return "http://localhost:3000";
}

export const site = {
  name: "Boaive",
  tagline: "Float Your Thrive",
  /** The story behind the name, used in the studio section and structured data. */
  nameMeaning: "Boat + Thrive",
  url: resolveSiteUrl(),
  locale: "en_IN",

  /** What Boaive is, in the words used in titles, schema and profiles. Keep it identical everywhere. */
  category: "AI, Custom Software & Cloud Engineering Studio",

  /** Service-area business: no public street address. */
  location: {
    locality: "Chengalpattu",
    region: "Tamil Nadu",
    country: "IN",
    countryName: "India",
    areaServed: ["Chengalpattu", "Chennai", "India"],
  },

  seo: {
    title: "Boaive — AI, Custom Software & Cloud Engineering Studio in Chengalpattu & Chennai",
    titleTemplate: "%s — Boaive",
    description:
      "Boaive builds intelligent business systems through AI, custom software and cloud engineering: AI assistants, intelligent automation, business platforms, cloud-native systems and data solutions, plus websites and apps. Based in Chengalpattu, serving Chennai and India.",
    keywords: [
      "Boaive",
      "Boaive Chengalpattu",
      "Boaive Chennai",
      "AI development company Chennai",
      "AI assistant development",
      "RAG knowledge assistant",
      "LLM integration",
      "AI agent development",
      "intelligent automation",
      "business process automation",
      "workflow automation",
      "custom software development Chennai",
      "custom software development Chengalpattu",
      "business management software",
      "internal tools development",
      "SaaS development",
      "API development",
      "cloud engineering",
      "DevOps services",
      "CI/CD pipelines",
      "AWS cloud solutions",
      "data analytics dashboards",
      "business intelligence dashboards",
      "web application development",
      "website development Chennai",
      "mobile app development",
    ],
  },

  contact: {
    whatsapp: {
      /** International format, digits only — used by wa.me links. */
      number: "918110823730",
      display: "+91 81108 23730",
    },
    phone: {
      href: "tel:+918110823730",
      display: "+91 81108 23730",
    },
    email: "boaive.tech@gmail.com",
    instagram: {
      handle: "boaive",
      url: "https://www.instagram.com/boaive/",
    },
  },
} as const;

export type NavItem = {
  label: string;
  chapter: ChapterId;
  /** Off the home page, this page stands in for the chapter. */
  page?: string;
};

/** Primary navigation — each item jumps to a chapter of the story. */
export const primaryNav: NavItem[] = [
  { label: "Work", chapter: "work", page: "/work" },
  { label: "What we build", chapter: "capabilities" },
  { label: "Process", chapter: "process" },
  { label: "Studio", chapter: "studio" },
  { label: "Contact", chapter: "contact" },
];
