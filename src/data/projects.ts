import type { MediaImage, Project, ProjectMedia } from "./types";

/**
 * Portfolio data.
 *
 * To add a project:
 *   1. Capture visuals:  npm run capture -- <slug> <url> --at="#section|text:Heading"
 *   2. Add an entry below using `workMedia()` to reference the captured files.
 *   3. Set `featured: true` to give it a screen in the home page story (keep 3–5 featured).
 * Everything else (/work archive, case study dialog + /work/<slug> page, 3D screen, sitemap) is automatic.
 *
 * Rules: never invent outcomes, metrics or client quotes. Anything that isn't paid client work is
 * `kind: "experiment"` (a self-initiated build for a type of business) or `"prototype"` (R&D),
 * and carries a disclaimer.
 */

type MediaSpec = {
  /** Descriptions of desktop-1…n screenshots, in order. */
  desktop: string[];
  /** Descriptions of mobile-1…n screenshots, in order. */
  mobile: string[];
  /** Extra captured pages (page-<name>.webp), with descriptions. */
  pages?: Record<string, string>;
  /** Description of the scroll-through video, if captured. */
  video?: string;
  /** Description of poster.webp when it isn't the first screen (replaced after capture). */
  poster?: string;
};

/** Builds media paths from the naming convention used by scripts/capture-project.mjs. */
function workMedia(slug: string, title: string, spec: MediaSpec): ProjectMedia {
  const base = `/work/${slug}`;
  const desktop = (src: string, alt: string): MediaImage => ({ src, alt, width: 1600, height: 1000 });
  const posterAlt = spec.poster ?? `${title} — first screen on desktop`;
  return {
    poster: desktop(`${base}/poster.webp`, posterAlt),
    posterSmall: { src: `${base}/poster-sm.webp`, alt: posterAlt, width: 800, height: 500 },
    gallery: [
      ...spec.desktop.map((alt, i) => desktop(`${base}/desktop-${i + 1}.webp`, alt)),
      ...Object.entries(spec.pages ?? {}).map(([name, alt]) => desktop(`${base}/page-${name}.webp`, alt)),
    ],
    mobile: spec.mobile.map((alt, i) => ({ src: `${base}/mobile-${i + 1}.webp`, alt, width: 720, height: 1558 })),
    video: spec.video
      ? { src: `${base}/tour.mp4`, poster: `${base}/poster.webp`, width: 1280, height: 800, description: spec.video }
      : undefined,
  };
}

export const projects: Project[] = [
  {
    slug: "shapio3d",
    title: "Shapio 3D",
    kind: "client",
    featured: true,
    type: "Business website + client tracking portal",
    industry: "3D printing & additive manufacturing",
    capabilities: ["web", "software"],
    summary:
      "The website and customer front door for a 3D printing company — from a first question or file upload to tracking an order.",
    problem:
      "Shapio 3D makes prototypes, functional parts and production runs for engineers, manufacturers, researchers and students. Customers arrive with very different starting points — a finished CAD file, a rough idea, a batch of thousands — and need to know quickly whether Shapio can make it and how to get started.",
    approach:
      "We organised a broad catalogue into clear application areas, explained the ordering process in four steps, and kept the two things customers actually want to do — send a file, ask a question — within reach on every screen. After ordering, customers can follow their request themselves instead of calling for updates.",
    built: [
      "Marketing website: services, applications, process and project showcase",
      "Quote request form that accepts 3D models (STL, STEP) and reference images",
      "WhatsApp contact path throughout the site",
      "Client portal to track a request's status with a tracking ID",
      "Video-led hero sections, responsive from phone to desktop",
    ],
    technologies: ["React", "React Router", "Vite", "GSAP"],
    url: "https://shapio3d.com/",
    status: "live",
    accent: "#1ed28c",
    media: workMedia("shapio3d", "Shapio 3D", {
      desktop: [
        "Shapio 3D products and applications carousel with tooling and engineering categories",
        "Shapio 3D 'How it works' section explaining the four-step ordering process",
        "Shapio 3D showcase gallery of printed parts",
        "Shapio 3D contact section with quote form and 3D file upload",
      ],
      pages: { track: "Shapio 3D client portal where customers enter a tracking ID to see their request's status" },
      mobile: ["Shapio 3D first screen on a phone", "Shapio 3D product categories on a phone"],
      video: "A scroll through the Shapio 3D homepage: hero, product categories, process, gallery and contact form.",
    }),
    reviewNote:
      "Problem/approach framing is written from the live site. Confirm with the team (brief, year, scope, admin side of the tracking portal) before launch.",
  },
  {
    slug: "burger",
    title: "Burger Experiment",
    kind: "experiment",
    featured: true,
    type: "Scroll-driven 3D brand site",
    industry: "Burger joint",
    capabilities: ["web"],
    summary:
      "A fictional burger joint told in one scroll: the burger builds itself in 3D, one layer at a time, then each layer becomes a lesson in what makes a site memorable.",
    problem:
      "Most food websites are a hero photo and a menu. We wanted to find out whether a small food brand could be remembered the way a good meal is — by watching it being made.",
    approach:
      "The homepage is one scroll-driven 3D scene. Each step drops an ingredient into place, labelled like a technical drawing with its name and how it's prepared. Fries and a cola join the finished burger; then it comes apart into its eight layers, each relabelled as part of a digital experience — structure, story, identity, motion, detail. The menu and story pages keep the same voice.",
    built: [
      "Scroll-driven 3D build: ten pieces land one by one, each labelled as it arrives",
      "A finale that takes the burger apart and relabels each layer as part of a website",
      "Menu with hands-on items: take the burger apart, shake the fries, poke the cream",
      "Story page for the imaginary joint",
      "A text description of the animated scene for screen readers",
    ],
    technologies: ["Next.js", "React", "Three.js"],
    url: "https://theburgerexperiment.netlify.app/",
    status: "live",
    accent: "#e4472d",
    disclaimer: "The burger joint, menu, prices and reviews are fictional.",
    media: workMedia("burger", "Burger Experiment (experiment)", {
      poster: "The finished burger in 3D with its eight layers labelled, beside “Eight layers. No shortcuts.”",
      desktop: [
        "Burger layers dropping into place, each labelled like a technical drawing",
        "The finished burger beside fries and a cola",
        "Menu teaser: House Special, Loaded Fries and Strawberry Shake",
      ],
      pages: {
        menu: "Menu page: “Four burgers. A few sides. Cold drinks.” with order tickets pinned to a rail",
        story: "Story page: “Messy hands. Good decisions.” beside a 3D burger",
      },
      mobile: ["Burger experiment first screen on a phone", "The burger being built on a phone"],
      video: "A scroll through the burger experiment: the burger builds layer by layer, fries and a cola join it, then the menu.",
    }),
  },
  {
    slug: "restaurant",
    title: "Boaive Restaurant",
    kind: "experiment",
    featured: true,
    type: "Restaurant & lounge website",
    industry: "Fine dining",
    capabilities: ["web"],
    summary: "A fine-dining site that sells the evening, not just the menu — and turns interest into reservations.",
    problem:
      "Restaurant websites are often a PDF menu and a phone number. Guests decide on atmosphere, signature dishes and how easy it is to reserve a table.",
    approach:
      "Lead with the signature dishes and the room, make the full menu easy to browse by course, and keep reserve, call, WhatsApp and directions within reach on every screen.",
    built: [
      "Signature dish showcase with prices",
      "Menu browsable by course",
      "Chef story, reviews and press mentions",
      "Gallery of the room",
      "Reservation paths: call, WhatsApp, directions and Instagram",
    ],
    technologies: ["React", "React Router", "Vite", "Lenis"],
    url: "https://democafeboaive.vercel.app/",
    status: "live",
    accent: "#e0913a",
    disclaimer: "The restaurant, chef, reviews and press mentions shown are illustrative.",
    media: workMedia("restaurant", "Boaive Restaurant (experiment)", {
      desktop: [
        "Restaurant signature dish feature with ingredients and price",
        "Restaurant most-loved dishes with ratings and prices",
        "Restaurant menu browsable by course",
      ],
      mobile: ["Restaurant first screen on a phone", "Restaurant signature dish on a phone"],
      video: "A scroll through the restaurant experiment: hero, signature dishes and menu.",
    }),
  },
  {
    slug: "play",
    title: "Boaive Play",
    kind: "experiment",
    featured: true,
    type: "Entertainment venue website",
    industry: "Gaming & entertainment arena",
    capabilities: ["web"],
    summary:
      "An arena site with five bookable zones, side-by-side passes, live tournament countdowns and a filterable gallery.",
    problem:
      "Venues with many activities struggle to explain what's on, what it costs and when it's busy — so people call to ask, or don't come at all.",
    approach:
      "Each zone gets a clear card with duration, players and price. Passes are compared side by side. Weekly events show live countdowns. Booking follows the visitor down the page.",
    built: [
      "Zone explorer with duration, players and pricing per experience",
      "Pass comparison",
      "Weekly events with live countdown timers",
      "Filterable gallery",
      "Location, FAQs and booking section",
    ],
    technologies: ["Next.js", "React", "GSAP", "Lenis"],
    url: "https://demo-boaive-paly.vercel.app/",
    status: "live",
    accent: "#22d3ee",
    disclaimer: "The venue, prices, events and reviews shown are illustrative.",
    media: workMedia("play", "Boaive Play (experiment)", {
      desktop: [
        "Arena experiences section listing five zones with prices",
        "Arena passes and pricing comparison",
        "Arena weekly events with live countdowns",
      ],
      mobile: ["Arena first screen on a phone", "Arena experiences on a phone"],
      video: "A scroll through the arena experiment: hero, experiences, pricing and events.",
    }),
  },
  {
    slug: "clinic",
    title: "Boaive Clinic",
    kind: "experiment",
    // in the /work archive only; its home page screen went to the burger experiment
    featured: false,
    type: "Healthcare website",
    industry: "Dental, hair & skin clinic",
    capabilities: ["web"],
    summary:
      "A neighbourhood clinic site built around one job: helping a patient find the right department and book a visit without calling around.",
    problem:
      "Multi-speciality clinics often have websites that list everything and explain nothing. Patients want three answers fast: do you treat my problem, can I trust you, and how do I book?",
    approach:
      "Treatments are grouped by department behind a simple switcher. Trust comes from doctor profiles, a before/after comparison and upfront language about pricing. Booking is one tap away, by WhatsApp or phone, from every section.",
    built: [
      "Department switcher for dental, hair and skin treatments",
      "Draggable before/after comparison",
      "Doctor profiles, reviews and FAQs",
      "Appointment requests via WhatsApp and phone",
      "Location, hours and local search structure",
    ],
    technologies: ["Next.js", "React"],
    url: "https://boaive-clinic.vercel.app/",
    status: "live",
    accent: "#c9561a",
    disclaimer: "The clinic, doctors, reviews and figures shown are illustrative.",
    media: workMedia("clinic", "Boaive Clinic (experiment)", {
      desktop: [
        "Clinic treatments section with dental, hair and skin tabs",
        "Clinic before and after comparison slider",
        "Clinic doctor profiles",
      ],
      mobile: ["Clinic first screen on a phone", "Clinic treatments on a phone"],
      video: "A scroll through the clinic experiment: hero, treatments, results and doctors.",
    }),
  },
];

export const isClientWork = (p: Project) => p.kind === "client";
/** Experiments & prototypes: self-initiated, never presented as client work. */
export const isLabWork = (p: Project) => p.kind !== "client";

export const clientProjects = projects.filter(isClientWork);
export const labProjects = projects.filter(isLabWork);

/** Display order everywhere: client work first, then experiments & prototypes. */
export const orderedProjects = [...clientProjects, ...labProjects];

/** The screens in the home page's work chapter. */
export const featuredProjects = orderedProjects.filter((p) => p.featured);

export type WorkGroupId = "client" | "lab";

/** The two halves of the /work archive. */
export const workGroups: { id: WorkGroupId; projects: Project[] }[] = [
  { id: "client", projects: clientProjects },
  { id: "lab", projects: labProjects },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function kindLabel(p: Pick<Project, "kind">): string {
  switch (p.kind) {
    case "client":
      return "Client work";
    case "experiment":
      return "Experiment";
    case "prototype":
      return "Prototype";
  }
}
