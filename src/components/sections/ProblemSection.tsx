import type { CSSProperties } from "react";
import { problemCopy } from "@/content/home";
import { needs } from "@/data/needs";
import { beat, timing } from "@/story/timing";
import { Beats, Chapter, ChapterLabel } from "./Chapter";
import styles from "./ProblemSection.module.css";

/**
 * Where each need floats. Wide screens: a free field, `d` = [left %, top %].
 * Compact screens stack them one per row, shifted across by `f` (0 = left edge, 1 = right edge),
 * so nothing can overlap or run off the screen.
 */
const layout: { d: [number, number]; f: number }[] = [
  { d: [6, 62], f: 0.04 },
  { d: [60, 74], f: 0.68 },
  { d: [30, 36], f: 0.22 },
  { d: [68, 22], f: 0.96 },
  { d: [42, 54], f: 0.08 },
  { d: [12, 20], f: 0.8 },
  { d: [78, 48], f: 0.44 },
  { d: [22, 84], f: 0.1 },
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

        <div className={styles.needs} data-beat={beat(t.needs)} data-dy="0" data-progress="">
          <p className={`${styles.needsLabel} mono`}>{problemCopy.needsLabel}</p>
          <ul role="list" className={styles.needList}>
            {needs.map((need, i) => (
              <li
                key={need.text}
                className={styles.need}
                data-rise={(0.08 + need.depth * 0.16).toFixed(3)}
                data-rise-compact="0.04"
                style={
                  {
                    "--x": `${layout[i].d[0]}%`,
                    "--y": `${layout[i].d[1]}%`,
                    "--f": layout[i].f,
                    // compact screens: surfaces one after another, like messages arriving
                    "--in": (t.needs[0] + 0.01 + i * 0.028).toFixed(3),
                    "--depth": need.depth,
                  } as CSSProperties
                }
              >
                <span className={styles.chip}>
                  <span className={styles.bubble} aria-hidden="true" />
                  {need.text}
                </span>
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
