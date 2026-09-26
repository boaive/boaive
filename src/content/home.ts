/**
 * All copy for the home page story, by chapter.
 * Keep it short, concrete and human. No "unlock", "revolutionise", "cutting-edge".
 */

export const heroCopy = {
  eyebrow: "Digital product studio",
  title: "From idea to something that works.",
  lede: "Boaive designs and builds websites, software, apps, AI assistants and automation. We start from the problem, not from a template.",
  tagline: "Float your thrive",
  scrollCue: "Scroll to dive in",
  primaryCta: "Let's build",
  secondaryCta: "See the work",
  /** Appears while the boat scene plays. */
  floating: "Every product starts as an idea, floating somewhere.",
} as const;

export const diveCopy = {
  /** Visually hidden heading for the chapter. */
  heading: "Diving into the problem",
  splash: "So we dive in.",
  surface: "Good products aren't built on the surface.",
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
    "We don't sell fixed packages. These are the kinds of things we build — and most real projects combine a few of them.",
  close: {
    lead: "Doesn't fit a box? Good.",
    follow: "Bring the problem. We'll figure out what needs to be built.",
  },
} as const;

export const processCopy = {
  heading: "From idea to working product.",
  intro: "Five steps, in plain language. You always know where we are and what comes next.",
  deliverableLabel: "You get",
} as const;

export const workCopy = {
  heading: "Things we've built.",
  intro:
    "Real sites, live today. Client work first — then experiments: builds we made ourselves to explore how we'd approach a type of business.",
  clientLabel: "Client work",
  labLabel: "Experiments & prototypes",
  labNote:
    "Self-initiated builds, not client projects. The businesses, people, reviews and numbers inside them are illustrative.",
  labNotice: "Self-initiated — not a client project.",
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
  lede: "Client work for real businesses — and the experiments and prototypes where we try ideas out on our own. Every project comes with a case study.",
  groups: {
    client: {
      title: "Client work",
      intro: "Paid work for real businesses: what they needed, what we built, and where it runs today.",
    },
    lab: {
      title: "Experiments & prototypes",
      intro:
        "Self-initiated builds. We make these to explore how we'd approach a type of business, or to try an idea before it goes into client work.",
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
  parts: ["Website", "AI", "Mobile", "Software", "Automation", "Data"],
  connected: "All working together.",
  body: "The goal isn't a pretty interface. It's something your business can run on — it answers customers, saves hours and still makes sense as you grow.",
} as const;

export const studioCopy = {
  heading: "People who like building things that work.",
  body: [
    "Boaive comes from boat + thrive: the right product should carry a business forward, not weigh it down.",
    "We're designers and engineers who'd rather ship something useful than present something impressive. We keep things clear, explain our choices, and stay around after launch.",
  ],
  principles: [
    { title: "Problem first", text: "We work out what you actually need before deciding what to build." },
    { title: "Plain language", text: "No jargon, no black boxes. You'll always know what's happening and why." },
    { title: "Built to last", text: "Clean, documented work that can grow with you — or be handed over." },
    { title: "In it for the long run", text: "Launch is a beginning. We're here for fixes, changes and the next idea." },
  ],
} as const;

export const contactCopy = {
  heading: "Let's build.",
  tagline: "Float your thrive.",
  body: "Tell us what you're trying to do. A short message is enough to start — we'll reply with questions, not a sales pitch.",
  composerLabel: "What do you need?",
  whatsappCta: "Message us on WhatsApp",
  otherWays: "Or reach us on",
} as const;

export const footerCopy = {
  line: "Boaive is a digital studio. We turn ideas and problems into things that work.",
} as const;
