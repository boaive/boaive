import { featuredProjects } from "@/data/projects";

/** Work gives every featured project the same scroll, however many there are. */
const featured = featuredProjects.length;

/**
 * The story, in order. This list is shared by the DOM (sections, nav, depth gauge)
 * and the 3D stage (camera track, scene visibility).
 *
 * - `length`     Scroll length of the chapter in viewport heights (sets the pacing).
 * - `depth`      Metres shown on the depth gauge when the chapter starts (metaphorical).
 * - `world`      Which 3D world is on screen during the chapter.
 */
export const chapters = [
  { id: "float", title: "Float", depth: 0, world: "ocean", length: { desktop: 2.9, mobile: 2.5 } },
  { id: "dive", title: "Dive", depth: 2, world: "ocean", length: { desktop: 3.4, mobile: 2.9 } },
  { id: "problem", title: "The problem", depth: 40, world: "digital", length: { desktop: 3.0, mobile: 2.7 } },
  { id: "capabilities", title: "What we can do for you", depth: 70, world: "digital", length: { desktop: 6.2, mobile: 5.5 } },
  { id: "stack", title: "Technology", depth: 85, world: "digital", length: { desktop: 1.6, mobile: 1.6 } },
  { id: "usecases", title: "Use cases", depth: 100, world: "digital", length: { desktop: 1.8, mobile: 1.8 } },
  { id: "process", title: "Our delivery process", depth: 110, world: "digital", length: { desktop: 6.4, mobile: 5.6 } },
  { id: "work", title: "Work", depth: 140, world: "digital", length: { desktop: 1.8 + featured * 0.95, mobile: 1.6 + featured * 0.85 } },
  { id: "outcome", title: "Outcome", depth: 120, world: "digital", length: { desktop: 2.6, mobile: 2.3 } },
  { id: "studio", title: "Studio", depth: 80, world: "digital", length: { desktop: 2.2, mobile: 2.0 } },
  { id: "contact", title: "Surface", depth: 12, world: "ocean", length: { desktop: 2.6, mobile: 2.3 } },
] as const;

export type Chapter = (typeof chapters)[number];
export type ChapterId = Chapter["id"];
export type WorldId = Chapter["world"];

export const chapterIds = chapters.map((c) => c.id) as ChapterId[];

export const chapterIndex = Object.fromEntries(chapters.map((c, i) => [c.id, i])) as Record<ChapterId, number>;

export function getChapter(id: ChapterId): Chapter {
  return chapters[chapterIndex[id]];
}

/** Depth (metres) at a given story time, for the depth gauge. */
export function depthAt(storyTime: number): number {
  const i = Math.max(0, Math.min(chapters.length - 1, Math.floor(storyTime)));
  const t = Math.max(0, Math.min(1, storyTime - i));
  const from = chapters[i].depth;
  const to = i + 1 < chapters.length ? chapters[i + 1].depth : 0;
  return from + (to - from) * t;
}
