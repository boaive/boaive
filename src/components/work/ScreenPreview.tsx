"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Project } from "@/data/types";
import styles from "./ArchiveCard.module.css";

type Props = {
  project: Project;
  sizes: string;
  priority?: boolean;
};

/**
 * A project's first screen, framed like the screens in the story. With a mouse (and motion
 * allowed), hovering the card plays the recorded scroll-through in place; the video is only
 * fetched on the first hover.
 */
export function ScreenPreview({ project, sizes, priority = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const video = project.media.video;
  const poster = project.media.poster;

  useEffect(() => {
    const screen = ref.current;
    const v = videoRef.current;
    const card = screen?.closest<HTMLElement>("[data-card]");
    if (!screen || !v || !card || !video) return;

    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const enter = () => {
      if (!canHover.matches || reduced.matches) return;
      if (!v.getAttribute("src")) v.src = video.src;
      void v.play().catch(() => undefined);
    };
    const leave = () => {
      v.pause();
      delete screen.dataset.playing;
    };
    const playing = () => {
      screen.dataset.playing = "";
    };

    card.addEventListener("pointerenter", enter);
    card.addEventListener("pointerleave", leave);
    v.addEventListener("playing", playing);
    return () => {
      card.removeEventListener("pointerenter", enter);
      card.removeEventListener("pointerleave", leave);
      v.removeEventListener("playing", playing);
      v.pause();
    };
  }, [video]);

  return (
    <div ref={ref} className={styles.screen}>
      <div className={styles.picture}>
        <Image src={poster.src} alt={poster.alt} width={poster.width} height={poster.height} sizes={sizes} priority={priority} />
        {video ? (
          <video ref={videoRef} className={styles.video} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} />
        ) : null}
      </div>
    </div>
  );
}
