"use client";

import { useEffect, useRef, useState } from "react";
import { getChapter } from "@/story/chapters";
import styles from "@/components/layout/DepthGauge.module.css";

type Section = { id: string; label: string };

/** The archive continues below the story's work chapter: the page reads as a descent. */
const START = getChapter("work").depth;
const SPAN = 90;

/**
 * The story's depth gauge, on the /work page: a marker that sinks as you scroll, the depth
 * read-out, and a tick per section to jump to it.
 */
export function ArchiveGauge({ sections }: { sections: Section[] }) {
  const markerRef = useRef<HTMLSpanElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const [ticks, setTicks] = useState<number[]>(() => sections.map((_, i) => i / Math.max(1, sections.length - 1)));
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      setTicks(
        sections.map(({ id }) => {
          const el = document.getElementById(id);
          if (!el) return 0;
          return Math.min(1, Math.max(0, (el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.3) / max));
        }),
      );
    };
    const update = () => {
      raf = 0;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const f = Math.min(1, Math.max(0, window.scrollY / max));
      markerRef.current?.style.setProperty("--f", f.toFixed(4));
      if (readoutRef.current) readoutRef.current.textContent = `−${Math.round(START + f * SPAN)} m`;
      // the section whose top has passed the upper third of the screen
      let active = 0;
      sections.forEach(({ id }, i) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.35) active = i;
      });
      setCurrent(active);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      onScroll();
    };
    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [sections]);

  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    el.querySelector<HTMLElement>("h1, h2")?.focus({ preventScroll: true });
  };

  return (
    <nav aria-label="Archive sections" className={styles.gauge}>
      <ol role="list" className={styles.ticks}>
        {sections.map((section, i) => (
          <li key={section.id} className={styles.tick} style={{ ["--i" as string]: ticks[i] }}>
            <button type="button" aria-current={current === i ? "step" : undefined} onClick={() => jump(section.id)}>
              <span className={styles.tickLine} aria-hidden="true" />
              <span className={`${styles.tip} mono`}>
                {String(i + 1).padStart(2, "0")} {section.label}
              </span>
            </button>
          </li>
        ))}
      </ol>
      <span ref={markerRef} className={styles.marker} aria-hidden="true" />
      <span ref={readoutRef} className={`${styles.readout} mono`} aria-hidden="true">
        −{START} m
      </span>
    </nav>
  );
}
