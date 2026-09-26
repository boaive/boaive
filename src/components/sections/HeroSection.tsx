import { heroCopy } from "@/content/home";
import { introMessage, whatsappHref } from "@/lib/whatsapp";
import { beat, timing } from "@/story/timing";
import { Button } from "@/components/ui/Button";
import { ChapterLink } from "@/components/ui/ChapterLink";
import { ArrowRight, ArrowUpRight } from "@/components/ui/icons";
import { Beats, Chapter } from "./Chapter";
import styles from "./HeroSection.module.css";

/** 01 — Float. The boat, the engineer, the laptop. */
export function HeroSection() {
  const t = timing.float;
  return (
    <Chapter id="float" stageClassName={styles.stage}>
      <p className={`${styles.tagline} mono`} data-beat={beat(t.intro)} data-dy="0" aria-hidden="true">
        {heroCopy.tagline}
      </p>

      <Beats className={styles.beats}>
        <div className={styles.intro} data-beat={beat(t.intro)} data-dy="18">
          <div className={styles.titleBlock}>
            <p className={`${styles.eyebrow} mono`}>{heroCopy.eyebrow}</p>
            <h1 id="float-title" className={`${styles.title} t-h1 legible`} data-chapter-heading tabIndex={-1}>
              {heroCopy.title}
            </h1>
          </div>
          <div className={styles.side}>
            <p className={`${styles.lede} legible`}>{heroCopy.lede}</p>
            <div className={styles.actions}>
              <Button href={whatsappHref(introMessage())} external icon={<ArrowUpRight />}>
                {heroCopy.primaryCta}
              </Button>
              <ChapterLink chapter="work" variant="secondary" icon={<ArrowRight />}>
                {heroCopy.secondaryCta}
              </ChapterLink>
            </div>
          </div>
        </div>

        <p className={`${styles.floating} serif legible`} data-beat={beat(t.floating)}>
          {heroCopy.floating}
        </p>
      </Beats>

      <div className={styles.cue} data-beat={beat([0, 0.12])} data-dy="0" aria-hidden="true">
        <span className={styles.cueLine} />
        <span className="mono">{heroCopy.scrollCue}</span>
      </div>
    </Chapter>
  );
}
