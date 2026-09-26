import { processCopy } from "@/content/home";
import { processSteps } from "@/data/process";
import { beat, timing } from "@/story/timing";
import { StepNav } from "@/components/ui/StepNav";
import { Beats, Chapter, ChapterLabel } from "./Chapter";
import styles from "./ProcessSection.module.css";

/** 05 — How we build. One object transforms: idea → structure → design → code → product. */
export function ProcessSection() {
  const t = timing.process;
  const railStart = t.steps[0][0];
  const railSpan = t.steps[t.steps.length - 1][0] - railStart;
  return (
    <Chapter id="process" stageClassName={styles.stage}>
      <ChapterLabel id="process" className={styles.label} />

      <Beats className={styles.beats}>
        <div className={styles.intro} data-beat={beat(t.intro)}>
          <h2 id="process-title" className="t-h2 legible" data-chapter-heading tabIndex={-1}>
            {processCopy.heading}
          </h2>
          <p className={`${styles.introText} t-lede legible`}>{processCopy.intro}</p>
        </div>

        {processSteps.map((step, i) => (
          <article
            key={step.id}
            className={styles.step}
            data-beat={beat(t.steps[i])}
            data-fade="0.03"
            aria-labelledby={`step-${step.id}`}
          >
            <p className={`${styles.number} mono`}>
              Step <span className="accent">{String(i + 1).padStart(2, "0")}</span>
            </p>
            <h3 id={`step-${step.id}`} className={`${styles.name} t-h1 legible`}>
              {step.name}
            </h3>
            <p className={`${styles.description} t-lede legible`}>{step.description}</p>
            <p className={styles.deliverable}>
              <span className="mono">{processCopy.deliverableLabel}</span>
              <span>{step.deliverable}</span>
            </p>
          </article>
        ))}
      </Beats>

      <div
        className={styles.rail}
        data-progress=""
        style={{ ["--rail-start" as string]: railStart, ["--rail-span" as string]: railSpan }}
      >
        <span className={styles.railTrack} aria-hidden="true">
          <span className={styles.railFill} />
        </span>
        <StepNav
          chapter="process"
          label="Process steps"
          className={styles.railNav}
          steps={processSteps.map((step, i) => ({ id: step.id, label: step.name, range: [...t.steps[i]] as [number, number] }))}
        />
      </div>
    </Chapter>
  );
}
