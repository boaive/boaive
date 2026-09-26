import { diveCopy } from "@/content/home";
import { beat, timing } from "@/story/timing";
import { Beats, Chapter } from "./Chapter";
import styles from "./DiveSection.module.css";

/** 02 — Dive. The laptop falls; we follow it down and into the screen. */
export function DiveSection() {
  const t = timing.dive;
  return (
    <Chapter id="dive" stageClassName={styles.stage}>
      <h2 id="dive-title" className="sr-only" data-chapter-heading tabIndex={-1}>
        {diveCopy.heading}
      </h2>
      <Beats className={styles.beats}>
        <p className={`${styles.splash} serif legible`} data-beat={beat(t.splash)}>
          {diveCopy.splash}
        </p>
        <p className={`${styles.surface} t-h2 legible`} data-beat={beat(t.surface)}>
          {diveCopy.surface}
        </p>
        <p className={`${styles.deeper} t-lede legible`} data-beat={beat(t.deeper)}>
          {diveCopy.deeper}
        </p>
        <p className={`${styles.enter} mono`} data-beat={beat(t.enter)} data-dy="0">
          {diveCopy.enter}
          <span className={styles.cursor} aria-hidden="true" />
        </p>
      </Beats>
    </Chapter>
  );
}
