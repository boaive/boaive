import type { ProcessStep } from "./types";

/** Order matters: the 3D build object transforms through these stages in sequence. */
export const processSteps: ProcessStep[] = [
  {
    id: "understand",
    name: "Discover",
    description: "We learn the problem, the business, the people and the existing systems before choosing any technology.",
    deliverable: "Requirements and scope, written in plain language.",
  },
  {
    id: "design",
    name: "Architect",
    description: "We design the solution: how it's structured, how it connects to your tools, and how it stays secure, scalable and maintainable.",
    deliverable: "An architecture outline and a clickable prototype you can try before anything is built.",
  },
  {
    id: "build",
    name: "Engineer",
    description: "We build the real system in working increments: interface, logic, data, AI and integrations.",
    deliverable: "Working increments you can use as we go.",
  },
  {
    id: "refine",
    name: "Test",
    description: "We test, fix and tune until it works properly with real data, on real devices.",
    deliverable: "Test and release checks, with issues fixed before launch.",
  },
  {
    id: "launch",
    name: "Deploy",
    description: "We deploy, hand it over properly and stay around for what comes next.",
    deliverable: "A live system, handover documentation, and someone to call when you need changes.",
  },
];
