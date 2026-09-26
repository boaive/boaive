"use client";

import { useSyncExternalStore } from "react";
import { chapterIndex, chapters, type ChapterId } from "./chapters";

/**
 * The story store.
 *
 * Continuous values (scroll progress, pointer) are written on every scroll/pointer event and
 * read inside animation frames — they never trigger React renders.
 * Discrete values (active chapter, open project, sound…) notify subscribers when they change.
 */

export type Quality = "high" | "medium" | "low";
/** "lost": the GPU dropped the WebGL context (phones under memory pressure); the CSS story shows until it returns. */
export type StageStatus = "idle" | "loading" | "ready" | "unsupported" | "off" | "lost";

type Continuous = {
  /** chapterIndex + local progress (0 → chapters.length). */
  time: number;
  /** Local 0..1 progress of each chapter's scroll range (includes the hand-off from the previous chapter). */
  progress: Record<ChapterId, number>;
  /** Measured chapter lengths in viewport heights (section height / viewport height). */
  lengths: Record<ChapterId, number>;
  /** Bumped whenever the layout (and so every story-time conversion) changes. */
  layoutVersion: number;
  /** Pointer position, normalised to -1..1 (0 = centre). */
  pointer: { x: number; y: number };
  /** Opacity of the UI veil used for chapter jumps (0..1). Driven by lib/navigation. */
  jumpVeil: number;
};

type Discrete = {
  active: ChapterId;
  /** Project hovered/focused in the Work chapter (drives the 3D screens). */
  focusedProject: string | null;
  /** Project whose case study dialog is open. */
  openProject: string | null;
  quality: Quality;
  stage: StageStatus;
  reducedMotion: boolean;
  sound: boolean;
};

export type StoryState = Continuous & Discrete;

const initialProgress = Object.fromEntries(chapters.map((c) => [c.id, 0])) as Record<ChapterId, number>;
const initialLengths = Object.fromEntries(chapters.map((c) => [c.id, c.length.desktop])) as Record<ChapterId, number>;

export const story: StoryState = {
  time: 0,
  progress: initialProgress,
  lengths: initialLengths,
  layoutVersion: 0,
  pointer: { x: 0, y: 0 },
  jumpVeil: 0,
  active: "float",
  focusedProject: null,
  openProject: null,
  quality: "high",
  stage: "idle",
  reducedMotion: false,
  sound: false,
};

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Update discrete state; notifies subscribers only if something changed. */
export function setStory(patch: Partial<Discrete>) {
  let changed = false;
  for (const key of Object.keys(patch) as (keyof Discrete)[]) {
    if (story[key] !== patch[key]) {
      (story as Record<keyof Discrete, unknown>)[key] = patch[key];
      changed = true;
    }
  }
  if (changed) emit();
}

/** Write a chapter's scroll progress. Called by the ScrollDirector. */
export function setChapterProgress(id: ChapterId, progress: number) {
  story.progress[id] = progress;
  const index = chapterIndex[id];
  // The chapter that is currently between its start and end owns story time.
  if (progress > 0 && progress < 1) {
    story.time = index + progress;
    if (story.active !== id) setStory({ active: id });
  } else if (progress >= 1 && index === chapters.length - 1) {
    story.time = chapters.length;
  } else if (progress <= 0 && index === 0) {
    story.time = 0;
    if (story.active !== id) setStory({ active: id });
  }
}

/** Subscribe a component to one discrete value. */
export function useStory<K extends keyof Discrete>(key: K): Discrete[K] {
  return useSyncExternalStore(
    subscribe,
    () => story[key],
    () => serverSnapshot[key],
  );
}

const serverSnapshot: Discrete = {
  active: "float",
  focusedProject: null,
  openProject: null,
  quality: "high",
  stage: "idle",
  reducedMotion: false,
  sound: false,
};
