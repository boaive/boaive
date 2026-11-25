/**
 * All copy for the home page story, by chapter.
 * Keep it short, concrete and human. No "unlock", "revolutionise", "cutting-edge".
 */

export const heroCopy = {
  eyebrow: "AI, software & cloud engineering",
  title: "Intelligent business systems, engineered.",
  lede: "We build intelligent automation, AI-powered applications and cloud-native platforms. We start from the problem, not from a template.",
  tagline: "Float your thrive",
  scrollCue: "Scroll to dive in",
  primaryCta: "Discuss a project",
  secondaryCta: "Explore capabilities",
  /** Appears while the boat scene plays. */
  floating: "Every system starts as an idea, floating somewhere.",
} as const;

export const diveCopy = {
  /** Visually hidden heading for the chapter. */
  heading: "Diving into the problem",
  splash: "So we dive in.",
  surface: "Good systems aren't built on the surface.",
  deeper: "We go deep — into the problem, the business and the people who'll use it.",
  enter: "Step inside",
} as const;

export const problemCopy = {
  heading: "It starts with you.",
  statements: ["Your business has a problem.", "You have an idea.", "You need something that works."],
  needsLabel: "Things people tell us",
  close: {
    lead: "You bring the problem.",
    follow: "We figure out what needs to be built.",
  },
} as const;

export const capabilitiesCopy = {
  heading: "Built around what your business actually needs.",
  intro:
    "We don't sell fixed packages. Most real projects combine a few of these.",
  close: {
    lead: "Doesn't fit a box? Good.",
    follow: "Bring the problem. We'll figure out what needs to be built.",
  },
} as const;

export const stackCopy = {
  heading: "Technology we work with.",
  intro: "Grouped by what it's for. The stack is selected around your project's requirements, not the other way round.",
  note: "We choose tools to fit the problem, your team and your budget.",
  groups: [
    {
      title: "AI",
      items: ["LLM APIs", "Retrieval-augmented generation (RAG)", "Vector search", "Embeddings", "Agent frameworks", "Model integrations"],
    },
    {
      title: "Cloud & DevOps",
      items: ["AWS", "Docker", "Kubernetes", "CI/CD", "Infrastructure as code", "Monitoring & observability"],
    },
    {
      title: "Engineering",
      items: ["Frontend frameworks", "Backend languages", "APIs", "SQL & NoSQL databases", "Authentication systems"],
    },
  ],
} as const;

export const useCasesCopy = {
  heading: "What we can build for your business.",
  intro: "A few ways we can help, grouped by the outcome you're after.",
  note: "These are areas we are actively expanding into.",
  groups: [
    {
      outcome: "Reduce repetitive work",
      examples: [
        { title: "Internal AI knowledge assistant", text: "Ask questions in plain language and get answers from your own documents and policies." },
        { title: "Document-processing workflow", text: "Pull the data out of invoices, forms and emails, check it and route it for approval." },
      ],
    },
    {
      outcome: "Improve customer response",
      examples: [
        { title: "Customer-support automation", text: "Answer common questions instantly, and hand the rest to your team with the context attached." },
      ],
    },
    {
      outcome: "Centralise operations",
      examples: [
        { title: "Custom CRM / ERP-style platform", text: "Customers, orders, stock and tasks in one system shaped around how you work." },
      ],
    },
    {
      outcome: "Gain visibility into performance",
      examples: [
        { title: "Inventory or operations dashboard", text: "Live numbers from the tools you already use, in one place your team can read." },
        { title: "Cloud deployment & monitoring setup", text: "Repeatable releases and alerts, so you know when something is wrong before customers do." },
      ],
    },
  ],
} as const;

export const processCopy = {
  heading: "Our delivery process.",
  intro: "In plain language, from your first message to growth after launch.",
  deliverableLabel: "You get",
} as const;

export const workCopy = {
  heading: "Things we've built.",
  intro:
    "Client work first, then experiments: concept builds we made ourselves to explore how we'd approach a type of business. Each case study covers the problem, the solution, the features and the technology.",
  clientLabel: "Client work",
  labLabel: "Experiments & prototypes",
  labNote:
    "Self-initiated concept builds, not client projects. The businesses, people, reviews and numbers inside them are illustrative.",
  labNotice: "Self-initiated concept build — not a client project.",
  openCaseStudy: "View case study",
  visitSite: "Visit live site",
  similar: "Start something similar",
  allWork: "All work",
  /** The chapter's closing beat: the way into the full archive. */
  more: {
    eyebrow: "The archive",
    heading: "Everything we've built.",
    body: "Client work first, then the experiments and prototypes where we try ideas out — each with its own case study.",
    cta: "View all work",
  },
} as const;

/** The /work archive page. */
export const archiveCopy = {
  title: "All work",
  description:
    "Every Boaive project in one place: client work for real businesses, plus the experiments and prototypes where we try ideas out.",
  heading: "Everything we've built.",
  lede: "Client work for real businesses, and the experiments and prototypes where we try ideas out on our own. Every project comes with a case study. AI, automation, cloud and business-software case studies will be added as that work is delivered.",
  groups: {
    client: {
      title: "Client work",
      intro: "Paid work for real businesses: what they needed, what we built, and where it runs today.",
    },
    lab: {
      title: "Experiments & prototypes",
      intro:
        "Self-initiated concept builds. We make these to explore how we'd approach a type of business, or to try an idea before it goes into client work.",
      note: "Not client projects — the businesses, people, reviews and numbers inside them are illustrative.",
    },
  },
  caseStudy: "Case study",
  liveSite: "Live site",
  cta: {
    heading: "Have something like this in mind?",
    body: "Tell us about it. A short message is enough — we'll reply with questions, not a sales pitch.",
  },
} as const;

export const outcomeCopy = {
  heading: { lead: "Not just a screen.", follow: "A working system." },
  parts: ["AI", "Automation", "Software", "Cloud", "Analytics", "Web & Apps", "Marketing"],
  connected: "All working together.",
  body: "The goal isn't a pretty interface. It's something your business can run on: it answers customers, saves hours, shows you how you're performing and still makes sense as you grow.",
} as const;

export const studioCopy = {
  heading: "Technology that moves your business forward.",
  body: [
    "Boaive comes from boat + thrive: the right technology should carry your business forward, not weigh it down.",
    "We help you build what you need, simplify how work gets done and grow your business, with a team that stays with you after launch.",
  ],
  principles: [
    { title: "Understand your business", text: "We learn how you work and what you want to achieve before suggesting anything." },
    { title: "Explain things clearly", text: "Plain language, no jargon. You'll know what we're doing and why." },
    { title: "Build for growth", text: "Clean, documented work that can grow with you, or be handed over." },
    { title: "Support beyond launch", text: "Fixes, changes and the next idea: we're still here after go-live." },
  ],
} as const;

export const contactCopy = {
  heading: "Let's build.",
  tagline: "Float your thrive.",
  body: "Tell us what you're trying to do. A short message is enough to start — we'll reply with questions, not a sales pitch.",
  composerLabel: "What do you need?",
  briefLabel: "What process, system or experience are you trying to improve?",
  briefPlaceholder: "Optional — e.g. we answer the same questions all day…",
  whatsappCta: "Message us on WhatsApp",
  otherWays: "Or reach us on",
} as const;

export const footerCopy = {
  line: "Boaive is an AI, software and cloud engineering studio. We build intelligent business systems that work.",
} as const;
