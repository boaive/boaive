"use client";

import { useEffect, useRef } from "react";
import { chapters, depthAt } from "@/story/chapters";
import { story, useStory } from "@/story/store";
import { goToChapter } from "@/lib/navigation";
import styles from "./DepthGauge.module.css";

/**
 * A depth gauge on the right edge: where you are in the story, and a way to jump.
 * The marker and read-out update per frame without React renders.
 */
export function DepthGauge() {
  const active = useStory("active");
  const markerRef = useRef<HTMLSpanElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    let last = -1;
    const loop = () => {
      const t = story.time;
      if (Math.abs(t - last) > 0.0005) {
        last = t;
        const f = Math.min(1, t / (chapters.length - 1));
        markerRef.current?.style.setProperty("--f", f.toFixed(4));
        if (readoutRef.current) readoutRef.current.textContent = `−${Math.round(depthAt(t))} m`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <nav aria-label="Story chapters" className={styles.gauge} data-hidden={active === "float" ? "" : undefined}>
      <ol role="list" className={styles.ticks}>
        {chapters.map((c, i) => (
          <li key={c.id} className={styles.tick} style={{ ["--i" as string]: i / (chapters.length - 1) }}>
            <button
              type="button"
              aria-current={active === c.id ? "step" : undefined}
              onClick={() => void goToChapter(c.id)}
            >
              <span className={styles.tickLine} aria-hidden="true" />
              <span className={`${styles.tip} mono`}>
                {String(i + 1).padStart(2, "0")} {c.title}
              </span>
            </button>
          </li>
        ))}
      </ol>
      <span ref={markerRef} className={styles.marker} aria-hidden="true" />
      <span ref={readoutRef} className={`${styles.readout} mono`} aria-hidden="true">
        −0 m
      </span>
    </nav>
  );
}
