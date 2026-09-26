import type { CSSProperties } from "react";
import { problemCopy } from "@/content/home";
import { needs } from "@/data/needs";
import { beat, timing } from "@/story/timing";
import { Beats, Chapter, ChapterLabel } from "./Chapter";
import styles from "./ProblemSection.module.css";

/** Where each need floats: [left %, top %] on desktop and on phones. */
const layout: { d: [number, number]; m: [number, number] }[] = [
  { d: [6, 62], m: [4, 58] },
  { d: [60, 74], m: [44, 70] },
  { d: [30, 36], m: [22, 34] },
  { d: [68, 22], m: [40, 20] },
  { d: [42, 54], m: [8, 46] },
  { d: [12, 20], m: [6, 26] },
  { d: [78, 48], m: [36, 84] },
  { d: [22, 84], m: [10, 76] },
];

/** 03 — The problem. Boaive starts with the client's problem, not a technology. */
export function ProblemSection() {
  const t = timing.problem;
  const statementsOut = t.statements[1];
  return (
    <Chapter id="problem" stageClassName={styles.stage}>
      <ChapterLabel id="problem" className={styles.label} />
      <Beats className={styles.beats}>
        <h2 id="problem-title" className={`${styles.statements} t-h2 legible`} data-chapter-heading tabIndex={-1}>
          {problemCopy.statements.map((line, i) => (
            <span key={line} data-beat={beat([i === 0 ? 0 : 0.02 + i * 0.07, statementsOut])}>
              {line}
            </span>
          ))}
        </h2>

        <div className={styles.needs} data-beat={beat(t.needs)} data-dy="0">
          <p className={`${styles.needsLabel} mono`}>{problemCopy.needsLabel}</p>
          <ul role="list" className={styles.needList}>
            {needs.map((need, i) => (
              <li
                key={need.text}
                className={styles.need}
                data-rise={(0.08 + need.depth * 0.16).toFixed(3)}
                style={
                  {
                    "--x": `${layout[i].d[0]}%`,
                    "--y": `${layout[i].d[1]}%`,
                    "--mx": `${layout[i].m[0]}%`,
                    "--my": `${layout[i].m[1]}%`,
                    "--depth": need.depth,
                  } as CSSProperties
                }
              >
                <span className={styles.bubble} aria-hidden="true" />
                {need.text}
              </li>
            ))}
          </ul>
        </div>

        <p className={styles.close} data-beat={beat(t.close)}>
          <span className="t-h2 legible">{problemCopy.close.lead}</span>
          <span className={`${styles.closeFollow} serif legible`}>{problemCopy.close.follow}</span>
        </p>
      </Beats>
    </Chapter>
  );
}
