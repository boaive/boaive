import { outcomeCopy } from "@/content/home";
import { beat, sequence, timing } from "@/story/timing";
import { Chapter, ChapterLabel } from "./Chapter";
import styles from "./OutcomeSection.module.css";

/** 07 — Outcome. Everything built so far connects into one working system. */
export function OutcomeSection() {
  const t = timing.outcome;
  const partBeats = sequence(outcomeCopy.parts.length, t.parts[0], t.parts[1]);
  return (
    <Chapter id="outcome" stageClassName={styles.stage}>
      <ChapterLabel id="outcome" className={styles.label} />
      <div className={styles.content}>
        <h2 id="outcome-title" className={`${styles.heading} t-display legible`} data-chapter-heading tabIndex={-1}>
          <span data-beat="0,1">{outcomeCopy.heading.lead}</span>
          <span className={styles.follow} data-beat="0.1,1">
            {outcomeCopy.heading.follow}
          </span>
        </h2>

        <ul role="list" className={styles.parts} aria-label="What it connects">
          {outcomeCopy.parts.map((part, i) => (
            <li key={part} data-beat={beat([partBeats[i][0], 1])} data-dy="10" data-fade="0.03">
              {part}
            </li>
          ))}
        </ul>

        <div className={styles.connected} data-beat={beat(t.connected)}>
          <p className={`${styles.connectedLine} serif legible`}>{outcomeCopy.connected}</p>
          <p className={`${styles.body} legible`}>{outcomeCopy.body}</p>
        </div>
      </div>
    </Chapter>
  );
}
