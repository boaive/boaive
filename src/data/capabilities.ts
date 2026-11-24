import type { Capability } from "./types";

/**
 * Order matters: it is the order of the six forms on the ring in the 3D world
 * (see FORMS in experience/objects/digital/CapabilityForms.tsx).
 * Each card reads: business problem → what we build → practical outcome.
 */
export const capabilities: Capability[] = [
  {
    id: "ai",
    short: "AI",
    name: "AI & Agentic Systems",
    headline: "AI that takes real work off your team.",
    problem: "Staff lose hours searching documents, answering the same questions and sorting information by hand.",
    build: "AI assistants, retrieval-augmented generation (RAG) knowledge assistants, LLM integrations, multi-step agent workflows and document intelligence.",
    outcome: "Answers in seconds, from your own documents, and less repetitive thinking for your team.",
    items: ["AI assistants", "RAG & knowledge assistants", "LLM integrations", "Agent workflows", "Document intelligence"],
  },
  {
    id: "automation",
    short: "Automation",
    name: "Intelligent Automation",
    headline: "Less manual work. Fewer things forgotten.",
    problem: "Work moves between people, spreadsheets and inboxes, and steps get missed.",
    build: "Workflow orchestration, API integrations, approval flows, data extraction and operational automations that connect the tools you already use.",
    outcome: "Routine steps run by themselves, approvals are tracked, and your team handles only the exceptions.",
    items: ["Workflow orchestration", "API integrations", "Process automation", "Approval flows", "Data extraction"],
  },
  {
    id: "software",
    short: "Software",
    name: "Custom Software & Platforms",
    headline: "The system behind the business.",
    problem: "Off-the-shelf tools don't match how you work, so you bend your process around the software.",
    build: "Business management systems, internal portals, SaaS products, dashboards, backend services and APIs, designed around your workflow.",
    outcome: "One place to run operations, built to grow with the business instead of holding it back.",
    items: ["Business systems", "Internal portals", "SaaS products", "Backend services", "API development"],
  },
  {
    id: "cloud",
    short: "Cloud",
    name: "Cloud & DevOps Engineering",
    headline: "Software that ships safely and stays up.",
    problem: "Releases are manual and risky, and nobody sees a problem until a customer reports it.",
    build: "Cloud architecture, containerisation, CI/CD, infrastructure automation, deployment pipelines, observability and reliability engineering.",
    outcome: "Repeatable deployments, visibility into how systems behave, and fewer surprises in production.",
    items: ["Cloud architecture", "Containers", "CI/CD pipelines", "Infrastructure automation", "Observability"],
  },
  {
    id: "data",
    short: "Data",
    name: "Data & Analytics",
    headline: "See how the business is actually performing.",
    problem: "Data is spread across tools and files, so reports take days and decisions rely on guesswork.",
    build: "Data pipelines, reporting dashboards, business intelligence, data integration and operational insights.",
    outcome: "One trusted view of performance, updated automatically and easy to read.",
    items: ["Data pipelines", "Reporting dashboards", "Business intelligence", "Data integration", "Operational insights"],
  },
  {
    id: "digital",
    short: "Digital",
    name: "Digital Experiences",
    headline: "Websites and apps people actually use.",
    problem: "Your customers' first contact with you is slow, unclear or hard to use.",
    build: "High-performance websites, web applications, e-commerce and mobile applications, fast, findable and easy to update.",
    outcome: "A clear front door for customers, connected to the systems behind it.",
    items: ["Websites", "Web applications", "E-commerce", "Mobile applications"],
  },
];
