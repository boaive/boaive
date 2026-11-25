import { capabilitiesCopy } from "@/content/home";
import { capabilities } from "@/data/capabilities";
import { beat, timing } from "@/story/timing";
import { StepNav } from "@/components/ui/StepNav";
import { Beats, Chapter, ChapterLabel } from "./Chapter";
import styles from "./CapabilitiesSection.module.css";

/** 04 — What we build. The services emerge from the world, one at a time. */
export function CapabilitiesSection() {
  const t = timing.capabilities;
  return (
    <Chapter id="capabilities" stageClassName={styles.stage}>
      <ChapterLabel id="capabilities" className={styles.label} />

      <Beats className={styles.beats}>
        <div className={styles.intro} data-beat={beat(t.intro)}>
          <h2 id="capabilities-title" className="t-h2 legible" data-chapter-heading tabIndex={-1}>
            {capabilitiesCopy.heading}
          </h2>
          <p className={`${styles.introText} t-lede legible`}>{capabilitiesCopy.intro}</p>
        </div>

        {capabilities.map((cap, i) => (
          <article
            key={cap.id}
            className={styles.capability}
            data-beat={beat(t.items[i])}
            data-fade="0.028"
            aria-labelledby={`capability-${cap.id}`}
          >
            <h3 id={`capability-${cap.id}`} className={`${styles.name} t-display legible`}>
              {cap.name}
            </h3>
            <p className={`${styles.headline} t-h4 legible`}>{cap.headline}</p>
            <p className={`${styles.description} legible`}>{cap.description}</p>
          </article>
        ))}

        <div className={styles.close} data-beat={beat(t.close)}>
          <p className="t-h2 legible">{capabilitiesCopy.close.lead}</p>
          <p className={`${styles.closeFollow} serif legible`}>{capabilitiesCopy.close.follow}</p>
        </div>
      </Beats>

      <StepNav
        chapter="capabilities"
        label="Services"
        className={styles.index}
        steps={capabilities.map((cap, i) => ({ id: cap.id, label: cap.short, range: [...t.items[i]] as [number, number] }))}
      />
    </Chapter>
  );
}
