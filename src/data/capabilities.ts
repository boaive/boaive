import type { Capability } from "./types";

/**
 * Order matters: it is the order of the six forms on the ring in the 3D world
 * (see FORMS in experience/objects/digital/CapabilityForms.tsx).
 * Cards show the name, one headline and one short description. Keep it brief.
 */
export const capabilities: Capability[] = [
  {
    id: "ai",
    short: "AI",
    name: "AI & Agentic Systems",
    headline: "AI that takes real work off your team.",
    description: "Assistants and agent workflows that answer questions, read your documents and handle the repetitive thinking.",
    items: ["AI assistants", "RAG & knowledge assistants", "LLM integrations", "Agent workflows", "Document intelligence"],
  },
  {
    id: "automation",
    short: "Automation",
    name: "Intelligent Automation",
    headline: "Less manual work. Fewer things forgotten.",
    description: "We connect the tools you already use and automate the steps your team repeats every day.",
    items: ["Workflow orchestration", "API integrations", "Process automation", "Approval flows", "Data extraction"],
  },
  {
    id: "software",
    short: "Software",
    name: "Custom Software & Platforms",
    headline: "The system behind the business.",
    description: "Business systems, portals, dashboards and APIs built around how you actually work.",
    items: ["Business systems", "Internal portals", "SaaS products", "Backend services", "API development"],
  },
  {
    id: "cloud",
    short: "Cloud",
    name: "Cloud & DevOps Engineering",
    headline: "Software that ships safely and stays up.",
    description: "Cloud setup, automated releases and monitoring, so your software ships safely and stays up.",
    items: ["Cloud architecture", "Containers", "CI/CD pipelines", "Infrastructure automation", "Observability"],
  },
  {
    id: "data",
    short: "Analytics",
    name: "Data & Analytics",
    headline: "See how the business is actually performing.",
    description: "Reports and dashboards that bring your numbers into one clear, up-to-date view.",
    items: ["Data pipelines", "Reporting dashboards", "Business intelligence", "Data integration", "Operational insights"],
  },
  {
    id: "digital",
    short: "Web & Apps",
    name: "Websites & Apps",
    headline: "Websites and apps people actually use.",
    description: "Websites, web apps, online stores and mobile apps that are fast, findable and easy to update.",
    items: ["Websites", "Web applications", "E-commerce", "Mobile applications"],
  },
  {
    id: "marketing",
    short: "Marketing",
    name: "Digital Marketing",
    headline: "Reach the people you want to work with.",
    description: "B2B LinkedIn campaigns, Meta ads and campaign planning for both B2B and B2C businesses.",
    items: ["B2B LinkedIn campaigns", "Meta ads", "Campaign planning for B2B & B2C"],
  },
];
