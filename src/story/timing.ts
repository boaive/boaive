import { featuredProjects } from "@/data/projects";

/**
 * Beat timings, as fractions of each chapter's pinned range (0 = stage pins, 1 = stage releases).
 * Imported by the DOM sections (data-beat) AND the 3D scenes, so text and camera stay in sync.
 */

export type Range = readonly [number, number];

/** Split [from, to] into `count` consecutive ranges. */
export function sequence(count: number, from: number, to: number, holdLast = false): Range[] {
  const size = (to - from) / count;
  return Array.from({ length: count }, (_, i) => {
    const a = from + i * size;
    const b = holdLast && i === count - 1 ? 1 : from + (i + 1) * size;
    return [round(a), round(b)] as const;
  });
}

const round = (v: number) => Math.round(v * 1000) / 1000;

export const beat = (r: Range) => `${r[0]},${r[1]}`;

export const timing = {
  float: {
    intro: [0, 0.3],
    floating: [0.38, 0.66],
    /** The boat rolls and the laptop slips (3D only). */
    slip: [0.7, 1],
  },
  dive: {
    splash: [0.03, 0.2],
    surface: [0.28, 0.52],
    deeper: [0.56, 0.8],
    enter: [0.86, 0.99],
  },
  problem: {
    statements: [0, 0.34],
    needs: [0.38, 0.8],
    close: [0.84, 1],
  },
  capabilities: {
    intro: [0, 0.1],
    items: sequence(6, 0.12, 0.9),
    close: [0.92, 1],
  },
  process: {
    intro: [0, 0.1],
    steps: sequence(5, 0.12, 0.94, true),
  },
  /** One beat per featured project (the chapter's length grows with the count — see chapters.ts). */
  work: {
    intro: [0, 0.1],
    projects: sequence(featuredProjects.length, 0.12, 0.87),
    /** The camera pulls back from the gallery: the way into the full archive. */
    more: [0.87, 1],
  },
  outcome: {
    heading: [0, 1],
    parts: [0.28, 0.72],
    connected: [0.74, 1],
  },
  contact: {
    ascent: [0.1, 0.4],
    final: [0.5, 1],
  },
} as const satisfies Record<string, Record<string, Range | Range[]>>;
