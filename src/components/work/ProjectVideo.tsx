"use client";

import { useEffect, useRef, useState } from "react";
import type { MediaVideo } from "@/data/types";
import styles from "./CaseStudy.module.css";

/**
 * Silent scroll-through of the live site. Plays only while visible, never under reduced motion,
 * and always has a visible pause control (WCAG 2.2.2).
 */
export function ProjectVideo({ video, title }: { video: MediaVideo; title: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !userPaused) void el.play().catch(() => undefined);
        else el.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [userPaused]);

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) {
      setUserPaused(false);
      void el.play().catch(() => undefined);
    } else {
      setUserPaused(true);
      el.pause();
    }
  };

  return (
    <figure className={styles.video}>
      <video
        ref={ref}
        src={video.src}
        poster={video.poster}
        width={video.width}
        height={video.height}
        muted
        loop
        playsInline
        preload="none"
        aria-label={`${title}: ${video.description}`}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button type="button" className={styles.videoToggle} onClick={toggle} aria-pressed={playing}>
        <span aria-hidden="true">{playing ? "❚❚" : "▶"}</span>
        <span className="mono">{playing ? "Pause preview" : "Play preview"}</span>
      </button>
      <figcaption className="sr-only">{video.description}</figcaption>
    </figure>
  );
}
