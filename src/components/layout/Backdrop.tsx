"use client";

import { useStory } from "@/story/store";
import type { ChapterId } from "@/story/chapters";
import styles from "./Backdrop.module.css";

type Scene = "night" | "underwater" | "deep" | "dawn";

const sceneFor: Record<ChapterId, Scene> = {
  float: "night",
  dive: "underwater",
  problem: "deep",
  capabilities: "deep",
  process: "deep",
  work: "deep",
  outcome: "deep",
  studio: "underwater",
  contact: "dawn",
};

/**
 * CSS rendition of each world. It is the loading state before WebGL starts and the designed
 * fallback when WebGL is unavailable — the story still reads without the 3D.
 */
export function Backdrop() {
  const active = useStory("active");
  const scene = sceneFor[active];
  return (
    <div className={styles.backdrop} data-scene={scene} aria-hidden="true">
      <div className={`${styles.layer} ${styles.night}`}>
        <span className={styles.horizon} />
        <Boat className={styles.boat} />
      </div>
      <div className={`${styles.layer} ${styles.underwater}`} />
      <div className={`${styles.layer} ${styles.deep}`} />
      <div className={`${styles.layer} ${styles.dawn}`}>
        <span className={styles.sun} />
        <span className={styles.horizon} />
        <Boat className={styles.boat} sail />
      </div>
    </div>
  );
}

/** Flat silhouette of the Boaive boat for the fallback scenes. */
function Boat({ className, sail = false }: { className?: string; sail?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 200 110" fill="none">
      <defs>
        <radialGradient id={sail ? "glow-dawn" : "glow-night"} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFB566" stopOpacity="0.85" />
          <stop offset="1" stopColor="#FF8A2A" stopOpacity="0" />
        </radialGradient>
      </defs>
      {sail ? (
        <>
          <path d="M104 12 L104 72 L58 72 Z" fill="#F3E6D6" fillOpacity="0.92" />
          <path d="M104 12 L104 72 L58 72 Z" stroke="#FFA448" strokeOpacity="0.55" strokeWidth="0.8" />
          <path d="M72 58 L90 40 L100 60 M90 40 L96 26" stroke="#FF8A2A" strokeOpacity="0.7" strokeWidth="0.8" />
          <line x1="105" y1="8" x2="105" y2="78" stroke="#0A1016" strokeWidth="2.2" />
        </>
      ) : (
        <circle cx="122" cy="60" r="24" fill="url(#glow-night)" />
      )}
      <path d="M28 76 Q100 92 176 74 L168 88 Q100 100 36 88 Z" fill="#070B10" />
      <g fill="#070B10">
        <circle cx={sail ? 118 : 112} cy={sail ? 56 : 62} r="6.2" />
        <path
          d={
            sail
              ? "M112 64 Q118 60 124 64 L126 80 L110 80 Z"
              : "M106 70 Q112 66 118 70 L121 82 L103 82 Z"
          }
        />
      </g>
      <path d={sail ? "M112.5 51 Q118 45.5 123.5 51 Z" : "M106.5 57 Q112 51.5 117.5 57 Z"} fill="#FF8A2A" />
      {!sail ? <rect x="120" y="70" width="9" height="6" rx="0.8" fill="#FFC07A" transform="rotate(-18 124 73)" /> : null}
    </svg>
  );
}
