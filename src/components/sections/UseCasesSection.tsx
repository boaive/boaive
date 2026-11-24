import type { CSSProperties } from "react";
import { useCasesCopy } from "@/content/home";
import { Chapter, ChapterLabel } from "./Chapter";
import styles from "./UseCasesSection.module.css";

/** What we can build for your business: concrete examples, grouped by outcome. Flowing content. */
export function UseCasesSection() {
  let n = 0;
  return (
    <Chapter id="usecases" pinned={false} className={styles.section}>
      <div className={styles.inner}>
        <ChapterLabel id="usecases" data-reveal="" />
        <div className={styles.head}>
          <h2 id="usecases-title" className="t-h2 legible" data-chapter-heading tabIndex={-1} data-reveal="">
            {useCasesCopy.heading}
          </h2>
          <p className="t-lede legible" data-reveal="" style={{ "--reveal-i": 1 } as CSSProperties}>
            {useCasesCopy.intro}
          </p>
        </div>
        <div className={styles.groups}>
          {useCasesCopy.groups.map((group) => (
            <section
              key={group.outcome}
              className={styles.group}
              aria-labelledby={`usecase-${group.outcome.replace(/\W+/g, "-")}`}
              data-reveal=""
              style={{ "--reveal-i": n++ % 3 } as CSSProperties}
            >
              <h3 id={`usecase-${group.outcome.replace(/\W+/g, "-")}`} className={`${styles.outcome} mono`}>
                {group.outcome}
              </h3>
              <ul role="list" className={styles.examples}>
                {group.examples.map((ex) => (
                  <li key={ex.title}>
                    <h4 className={styles.exTitle}>{ex.title}</h4>
                    <p>{ex.text}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <p className={`${styles.note} legible`} data-reveal="" role="note">
          {useCasesCopy.note}
        </p>
      </div>
    </Chapter>
  );
}
