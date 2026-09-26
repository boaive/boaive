"use client";

import type Lenis from "lenis";
import { chapterIds, type ChapterId } from "@/story/chapters";

/**
 * Chapter navigation.
 *
 * Jumping across a cinematic page shouldn't fly the camera through every chapter, so a jump
 * fades a veil in, moves the scroll position instantly, lets the story settle, and fades out.
 */

let lenis: Lenis | null = null;

export function registerLenis(instance: Lenis | null) {
  lenis = instance;
}

export function getLenis() {
  return lenis;
}

/** Where to land inside a chapter's pinned range (0 = start, 1 = end). */
const landing: Partial<Record<ChapterId, number>> = {
  contact: 1,
};

function isChapter(id: string): id is ChapterId {
  return (chapterIds as string[]).includes(id);
}

export function chapterScrollTarget(id: ChapterId): number | null {
  const el = document.getElementById(id);
  if (!el) return null;
  const top = el.getBoundingClientRect().top + window.scrollY;
  const pinned = Math.max(0, el.offsetHeight - window.innerHeight);
  return Math.round(top + pinned * (landing[id] ?? 0));
}

/** Scroll to a point inside a chapter's pinned range (used by in-chapter step navigation). */
export function scrollToChapterProgress(id: ChapterId, progress: number, immediate = false) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY;
  const pinned = Math.max(0, el.offsetHeight - window.innerHeight);
  scrollToY(Math.round(top + pinned * progress), immediate);
}

export function scrollToY(y: number, immediate: boolean) {
  if (lenis) lenis.scrollTo(y, { immediate, force: true, duration: immediate ? undefined : 1.2 });
  else window.scrollTo({ top: y, behavior: immediate ? "instant" : "smooth" });
}

function veil(): HTMLElement | null {
  return document.getElementById("jump-veil");
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

let jumping = false;

/** Jump to a chapter with a veil transition. Returns false if the chapter isn't on this page. */
export async function goToChapter(id: ChapterId, { focus = true } = {}): Promise<boolean> {
  const y = chapterScrollTarget(id);
  if (y == null) return false;
  if (jumping) return true;
  jumping = true;

  const v = veil();
  const distance = Math.abs(window.scrollY - y);
  const needsVeil = v && distance > window.innerHeight * 1.5;

  if (needsVeil) {
    v.dataset.state = "in";
    await wait(320);
  }
  scrollToY(y, Boolean(needsVeil) || distance < 4);
  if (!needsVeil && distance >= 4) await wait(1250);
  // let ScrollTrigger + the 3D story catch up before revealing
  await wait(needsVeil ? 140 : 0);
  if (v) v.dataset.state = "out";

  if (focus) {
    const heading = document.querySelector<HTMLElement>(`#${id} [data-chapter-heading]`);
    heading?.focus({ preventScroll: true });
  }
  history.replaceState(null, "", `#${id}`);
  jumping = false;
  return true;
}

/** On load: honour a #chapter hash without animation. */
export function jumpToHashOnLoad() {
  const id = decodeURIComponent(location.hash.slice(1));
  if (!id || !isChapter(id)) return;
  const y = chapterScrollTarget(id);
  if (y != null) scrollToY(y, true);
}

export { isChapter };
