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
  category: "Creative Website Design & Development Studio",

  /** Service-area business: no public street address. */
  location: {
    locality: "Chengalpattu",
    region: "Tamil Nadu",
    country: "IN",
    countryName: "India",
    areaServed: ["Chengalpattu", "Chennai", "India"],
  },

  seo: {
    title: "Boaive — Creative Website Design & Development Studio in Chengalpattu & Chennai",
    titleTemplate: "%s — Boaive",
    description:
      "Boaive designs and builds modern, interactive websites — creative, 3D, animated and storytelling sites, plus business websites, web apps, AI assistants and automation — for businesses in Chengalpattu, Chennai and across India.",
    keywords: [
      "Boaive",
      "Boaive website",
      "Boaive web design",
      "Boaive Chennai",
      "Boaive Chengalpattu",
      "website design Chengalpattu",
      "website development Chengalpattu",
      "web designer Chengalpattu",
      "web developer Chengalpattu",
      "website design Chennai",
      "website development Chennai",
      "web designer Chennai",
      "web development company Chennai",
      "affordable website design",
      "affordable website design Chennai",
      "low cost website design",
      "website for small business",
      "business website design",
      "creative website design",
      "interactive website design",
      "3D website design",
      "3D website development",
      "Three.js website development",
      "WebGL website",
      "storytelling website",
      "scroll storytelling website",
      "animated website design",
      "clinic website design",
      "restaurant website design",
      "custom web application",
      "custom software",
      "AI assistant",
      "business automation",
      "mobile app development",
    ],
  },

  contact: {
    whatsapp: {
      /** International format, digits only — used by wa.me links. */
      number: "919894688279",
      display: "+91 98946 88279",
    },
    phone: {
      href: "tel:+91 8110823730",
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
