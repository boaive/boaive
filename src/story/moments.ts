import { chapterIndex, type ChapterId } from "./chapters";
import { story } from "./store";

/**
 * Converting chapter-local coordinates to story time (chapter index + chapter progress).
 * Pinned progress p is the DOM beat coordinate (0 = stage pins, 1 = stage releases);
 * hand-off progress h covers the scroll where a chapter slides in over the previous one.
 */
export function timeAt(id: ChapterId, p: number): number {
  const index = chapterIndex[id];
  if (index === 0) return p;
  const L = story.lengths[id];
  return index + (p * (L - 1) + 1) / L;
}

export function handoffTimeAt(id: ChapterId, h: number): number {
  return chapterIndex[id] + h / story.lengths[id];
}

/** Pinned progress of a chapter at story time t (negative during its hand-off). */
export function pinnedAt(id: ChapterId, t: number): number {
  const index = chapterIndex[id];
  const pc = t - index;
  if (index === 0) return pc;
  const L = story.lengths[id];
  return (pc * L - 1) / Math.max(0.001, L - 1);
}

/** The physical beats of the story, in story time. Recomputed when the layout changes. */
export const moments = {
  /** The boat rolls; the laptop starts to slide. */
  slip: 0.7,
  /** The laptop leaves the boat. */
  leaveBoat: 0.97,
  /** It hits the water. */
  splash: 1.2,
  /** The camera is fully underwater. */
  submerged: 1.28,
  /** The laptop reboots with the Boaive mark. */
  boot: 1.5,
  /** The camera enters the screen → digital world. */
  enterScreen: 1.99,
  /** Rising out of the digital deep into the real sea. */
  surfaceSwap: 8.2,
  /** The camera breaks the surface at sunrise. */
  surfaceBreak: 8.6,
  refresh() {
    this.slip = timeAt("float", 0.7);
    this.leaveBoat = timeAt("float", 0.97);
    this.splash = handoffTimeAt("dive", 0.72);
    this.submerged = handoffTimeAt("dive", 0.97);
    this.boot = timeAt("dive", 0.34);
    this.enterScreen = timeAt("dive", 0.985);
    this.surfaceSwap = handoffTimeAt("contact", 0.35);
    this.surfaceBreak = timeAt("contact", 0.4);
  },
};
