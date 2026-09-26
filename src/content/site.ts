import type { ChapterId } from "@/story/chapters";

/**
 * Site-wide configuration: brand, contact channels, navigation and SEO defaults.
 * Contact details are the studio's public details (as used on the Boaive sample sites).
 */

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  // Vercel exposes the production domain at build time.
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const site = {
  name: "Boaive",
  tagline: "Float Your Thrive",
  /** The story behind the name, used in the studio section and structured data. */
  nameMeaning: "Boat + Thrive",
  url: resolveSiteUrl(),
  locale: "en_IN",

  seo: {
    title: "Boaive — Websites, Software, Apps, AI & Automation",
    titleTemplate: "%s — Boaive",
    description:
      "Boaive is a digital studio that turns ideas and business problems into working products: websites, web apps, custom software, mobile apps, AI assistants and automation.",
    keywords: [
      "digital studio",
      "website development",
      "web application development",
      "custom software",
      "AI assistant",
      "chatbot development",
      "business automation",
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
  { label: "Capabilities", chapter: "capabilities" },
  { label: "Process", chapter: "process" },
  { label: "Studio", chapter: "studio" },
  { label: "Contact", chapter: "contact" },
];
