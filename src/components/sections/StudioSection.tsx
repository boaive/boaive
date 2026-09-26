import type { CSSProperties } from "react";
import { studioCopy } from "@/content/home";
import { Chapter, ChapterLabel } from "./Chapter";
import styles from "./StudioSection.module.css";

/** 08 — Studio. Who Boaive is and how it works, while the camera rises toward the light. */
export function StudioSection() {
  return (
    <Chapter id="studio" pinned={false} className={styles.section}>
      <div className={styles.inner}>
        <ChapterLabel id="studio" data-reveal="" />
        <h2 id="studio-title" className={`${styles.heading} t-h2 legible`} data-chapter-heading tabIndex={-1} data-reveal="">
          {studioCopy.heading}
        </h2>
        <div className={styles.body}>
          {studioCopy.body.map((para, i) => (
            <p
              key={i}
              className={i === 0 ? "t-lede legible" : "legible"}
              data-reveal=""
              style={{ "--reveal-i": i + 1 } as CSSProperties}
            >
              {para}
            </p>
          ))}
        </div>
        <ol role="list" className={styles.principles}>
          {studioCopy.principles.map((principle, i) => (
            <li
              key={principle.title}
              className={styles.principle}
              data-reveal=""
              style={{ "--reveal-i": i } as CSSProperties}
            >
              <span className={`${styles.index} mono`}>{String(i + 1).padStart(2, "0")}</span>
              <h3 className={`${styles.principleTitle} t-h4`}>{principle.title}</h3>
              <p className={styles.principleText}>{principle.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </Chapter>
  );
}
