import type { CSSProperties } from "react";
import { stackCopy } from "@/content/home";
import { Chapter, ChapterLabel } from "./Chapter";
import styles from "./StackSection.module.css";

/** Technology we work with: grouped by capability, not a wall of logos. Flowing content. */
export function StackSection() {
  return (
    <Chapter id="stack" pinned={false} className={styles.section}>
      <div className={styles.inner}>
        <ChapterLabel id="stack" data-reveal="" />
        <div className={styles.head}>
          <h2 id="stack-title" className="t-h2 legible" data-chapter-heading tabIndex={-1} data-reveal="">
            {stackCopy.heading}
          </h2>
          <p className="t-lede legible" data-reveal="" style={{ "--reveal-i": 1 } as CSSProperties}>
            {stackCopy.intro}
          </p>
        </div>
        <div className={styles.groups}>
          {stackCopy.groups.map((group, i) => (
            <section
              key={group.title}
              className={styles.group}
              aria-labelledby={`stack-${i}`}
              data-reveal=""
              style={{ "--reveal-i": i } as CSSProperties}
            >
              <h3 id={`stack-${i}`} className={`${styles.groupTitle} mono`}>
                {group.title}
              </h3>
              <ul role="list" className={styles.items}>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <p className={`${styles.note} legible`} data-reveal="">
          {stackCopy.note}
        </p>
      </div>
    </Chapter>
  );
}
