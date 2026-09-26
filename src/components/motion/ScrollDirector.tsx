"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { chapters } from "@/story/chapters";
import { moments } from "@/story/moments";
import { setChapterProgress, setStory, story } from "@/story/store";
import { jumpToHashOnLoad, registerLenis, scrollToY } from "@/lib/navigation";

gsap.registerPlugin(ScrollTrigger);

/** Compact layouts (tablets, phones) — keep in sync with the CSS that stacks content at this width. */
const COMPACT = "(max-width: 1200px)";

/**
 * Owns scrolling for the home page story.
 *
 * 1. Smooth wheel scrolling (Lenis) driven by the GSAP ticker; touch keeps native scrolling.
 * 2. Contiguous chapter ranges → story time for the 3D stage.
 * 3. Declarative choreography inside each chapter's pinned stage:
 *      data-beat="in,out"     fade/rise in at `in`, out at `out` (fractions of the pinned range)
 *      data-rise="speed"      drift upward through the range (parallax), speed in viewport heights
 *      data-rise-compact      the speed to use on compact screens instead (e.g. a uniform drift)
 *      data-progress          receives --p (0..1) for CSS-driven effects
 *      data-steps             children with data-step="in,out" get aria-current while active
 */
export function ScrollDirector() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setStory({ reducedMotion: reduced });
    ScrollTrigger.config({ ignoreMobileResize: true });

    let lenis: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;
    if (!reduced) {
      lenis = new Lenis({ autoRaf: false, lerp: 0.1, smoothWheel: true, wheelMultiplier: 0.9 });
      lenis.on("scroll", ScrollTrigger.update);
      tick = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }
    registerLenis(lenis);

    const cleanups: (() => void)[] = [];
    const ctx = gsap.context(() => {
      chapters.forEach((chapter, i) => {
        const el = document.getElementById(chapter.id);
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: i === 0 ? "top top" : "top bottom",
          end: "bottom bottom",
          onUpdate: (self) => setChapterProgress(chapter.id, self.progress),
          onRefresh: (self) => {
            story.lengths[chapter.id] = el.offsetHeight / window.innerHeight;
            setChapterProgress(chapter.id, self.progress);
          },
        });
      });

      document.querySelectorAll<HTMLElement>("[data-chapter]").forEach((section) => {
        const cleanup = choreograph(section, reduced);
        if (cleanup) cleanups.push(cleanup);
      });
    });

    const onPointer = (e: PointerEvent) => {
      story.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      story.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    // Story-time conversions depend on the measured chapter lengths.
    const onRefresh = () => {
      moments.refresh();
      story.layoutVersion += 1;
    };
    ScrollTrigger.addEventListener("refresh", onRefresh);
    onRefresh();

    jumpToHashOnLoad();
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      window.removeEventListener("pointermove", onPointer);
      cleanups.forEach((fn) => fn());
      ctx.revert();
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
      registerLenis(null);
    };
  }, []);

  return null;
}

const parseRange = (value: string | undefined): [number, number] => {
  const [a = "0", b = "1"] = (value ?? "0,1").split(",");
  return [Number(a), Number(b)];
};

function choreograph(section: HTMLElement, reduced: boolean): (() => void) | undefined {
  const beats = [...section.querySelectorAll<HTMLElement>("[data-beat]")];
  const risers = [...section.querySelectorAll<HTMLElement>("[data-rise]")];
  const progressEls = [...section.querySelectorAll<HTMLElement>("[data-progress]")];
  const stepGroups = [...section.querySelectorAll<HTMLElement>("[data-steps]")];
  if (!beats.length && !risers.length && !progressEls.length && !stepGroups.length) return;

  const tl = gsap.timeline({ defaults: { ease: "none" } });
  tl.set({}, {}, 1); // normalise the timeline to a 0..1 duration

  for (const el of beats) {
    const [a, b] = parseRange(el.dataset.beat);
    const fade = Number(el.dataset.fade ?? 0.05);
    const dy = reduced ? 0 : Number(el.dataset.dy ?? 26);
    if (a > 0) {
      tl.fromTo(el, { opacity: 0, y: dy }, { opacity: 1, y: 0, duration: fade, ease: "power2.out" }, Math.max(0, a - fade));
    }
    if (b < 1) {
      tl.fromTo(
        el,
        { opacity: 1, y: 0 },
        { opacity: 0, y: -dy, duration: fade, ease: "power2.in", immediateRender: false },
        b - fade,
      );
    }
  }

  const compact = window.matchMedia(COMPACT);
  for (const el of risers) {
    if (reduced) continue;
    const wide = Number(el.dataset.rise);
    const narrow = el.dataset.riseCompact !== undefined ? Number(el.dataset.riseCompact) : wide;
    // functions are re-evaluated on every refresh, so crossing the breakpoint (resize, rotation) re-picks
    const speed = () => (compact.matches ? narrow : wide);
    tl.fromTo(el, { y: () => speed() * window.innerHeight }, { y: () => -speed() * window.innerHeight, duration: 1 }, 0);
  }

  // Invisible beats must not catch clicks.
  const syncPointer = () => {
    for (const el of beats) {
      el.style.pointerEvents = Number(gsap.getProperty(el, "opacity")) < 0.15 ? "none" : "";
    }
  };
  tl.eventCallback("onUpdate", syncPointer);

  const update = (p: number) => {
    for (const el of progressEls) el.style.setProperty("--p", p.toFixed(4));
    for (const group of stepGroups) {
      for (const step of group.querySelectorAll<HTMLElement>("[data-step]")) {
        const [a, b] = parseRange(step.dataset.step);
        const active = p >= a && p < b;
        if (active) step.setAttribute("aria-current", "step");
        else step.removeAttribute("aria-current");
      }
    }
  };

  const st = ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: "bottom bottom",
    animation: tl,
    scrub: reduced ? true : 0.45,
    invalidateOnRefresh: true,
    onUpdate: (self) => update(self.progress),
    onRefresh: (self) => update(self.progress),
  });
  syncPointer();

  // Keyboard users: focusing something inside a hidden beat scrolls the story to that beat.
  const onFocus = (e: FocusEvent) => {
    const beat = (e.target as HTMLElement).closest<HTMLElement>("[data-beat]");
    if (!beat) return;
    const [a, b] = parseRange(beat.dataset.beat);
    if (st.progress >= a && st.progress <= b) return;
    const inside = Math.min(b, a + Number(beat.dataset.fade ?? 0.05) + 0.01);
    scrollToY(st.start + (st.end - st.start) * inside, true);
  };
  section.addEventListener("focusin", onFocus);
  return () => section.removeEventListener("focusin", onFocus);
}
