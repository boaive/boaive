import type { Capability } from "./types";

/** Order matters: it is the order of the six forms on the ring in the 3D world. */
export const capabilities: Capability[] = [
  {
    id: "web",
    name: "Web",
    headline: "Websites and web apps people actually use.",
    description: "From a sharp marketing site to a full web application — fast, findable and easy to update.",
    items: ["Websites", "Web applications", "E-commerce", "Landing pages", "Interactive experiences"],
  },
  {
    id: "ai",
    name: "AI",
    headline: "AI that does a real job.",
    description: "Assistants and workflows that answer customers, sort information and take repetitive thinking off your plate.",
    items: ["AI assistants", "Chatbots", "AI-powered workflows", "Intelligent interfaces", "AI integrations"],
  },
  {
    id: "software",
    name: "Software",
    headline: "The system behind the business.",
    description: "Custom tools built around how you actually work, instead of bending your work around someone else's tool.",
    items: ["Custom software", "Dashboards", "Internal tools", "Backend systems", "APIs", "Databases"],
  },
  {
    id: "automation",
    name: "Automation",
    headline: "Less manual work. Fewer things forgotten.",
    description: "We connect the tools you already use and automate the steps your team repeats every day.",
    items: ["Workflow automation", "Business automation", "Integrations", "Process optimisation"],
  },
  {
    id: "mobile",
    name: "Mobile",
    headline: "In your customers' pockets.",
    description: "Mobile apps for iOS and Android — built once, cross-platform where it makes sense.",
    items: ["Mobile applications", "Cross-platform apps", "iOS & Android"],
  },
  {
    id: "custom",
    name: "Custom",
    headline: "Some problems don't fit a category.",
    description: "Unusual ideas, odd workflows, things nobody has a template for. We start with the problem and work out the right thing to build.",
    items: ["Custom digital solutions", "Prototypes & experiments", "Ideas that don't fit a box"],
  },
];
