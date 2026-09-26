import type { ProcessStep } from "./types";

/** Order matters: the 3D build object transforms through these stages in sequence. */
export const processSteps: ProcessStep[] = [
  {
    id: "understand",
    name: "Understand",
    description: "We learn the problem, the business and the goal before choosing any technology.",
    deliverable: "A clear scope, written in plain language.",
  },
  {
    id: "design",
    name: "Design",
    description: "We turn the idea into a clear experience and a system that holds together.",
    deliverable: "Designs you can click through before anything is built.",
  },
  {
    id: "build",
    name: "Build",
    description: "We develop the real product: interface, logic, data and integrations.",
    deliverable: "Working builds you can try as we go.",
  },
  {
    id: "refine",
    name: "Refine",
    description: "We test, fix, polish and optimise until it works properly on real devices.",
    deliverable: "A product that has been used, not just finished.",
  },
  {
    id: "launch",
    name: "Launch",
    description: "We ship a working solution, hand it over properly and stay around for what comes next.",
    deliverable: "A live product — and someone to call when you need changes.",
  },
];
