import Image from "next/image";
import { workCopy } from "@/content/home";
import { kindLabel, orderedProjects } from "@/data/projects";
import { beat, timing } from "@/story/timing";
import { Button } from "@/components/ui/Button";
import { StepNav } from "@/components/ui/StepNav";
import { ArrowUpRight } from "@/components/ui/icons";
import { CaseStudyButton } from "@/components/work/CaseStudyButton";
import { KindBadge } from "@/components/work/KindBadge";
import { Beats, Chapter, ChapterLabel } from "./Chapter";
import styles from "./WorkSection.module.css";

/** 06 — Work. Projects live as screens in the deep; each opens a case study. */
export function WorkSection() {
  const t = timing.work;
  const total = String(orderedProjects.length).padStart(2, "0");
  const firstSample = orderedProjects.findIndex((p) => p.kind !== "client");

  return (
    <Chapter id="work" stageClassName={styles.stage}>
      <div className={styles.head}>
        <ChapterLabel id="work" />
        <div className={styles.group}>
          <p className="mono" data-beat={beat([t.projects[0][0], firstSample > 0 ? t.projects[firstSample][0] : 1])} data-dy="0">
            <span className="accent">●</span> {workCopy.clientLabel}
          </p>
          {firstSample >= 0 ? (
            <p className="mono" data-beat={beat([t.projects[firstSample][0], 1])} data-dy="0">
              <span className={styles.sampleDot}>○</span> {workCopy.samplesLabel} — self-initiated
            </p>
          ) : null}
        </div>
      </div>

      <Beats className={styles.beats}>
        <div className={styles.intro} data-beat={beat(t.intro)}>
          <h2 id="work-title" className="t-h2 legible" data-chapter-heading tabIndex={-1}>
            {workCopy.heading}
          </h2>
          <p className={`${styles.introText} t-lede legible`}>{workCopy.intro}</p>
        </div>

        {orderedProjects.map((project, i) => (
          <article
            key={project.slug}
            className={styles.project}
            data-beat={beat(t.projects[i])}
            data-fade="0.03"
            aria-labelledby={`project-${project.slug}`}
          >
            <div className={styles.projectText}>
              <p className={styles.projectMeta}>
                <KindBadge project={project} />
                <span className="mono">
                  {String(i + 1).padStart(2, "0")} / {total}
                </span>
              </p>
              <h3 id={`project-${project.slug}`} className={`${styles.title} t-h2 legible`}>
                {project.title}
              </h3>
              <p className={`${styles.type} mono`}>
                {project.type} · {project.industry}
              </p>
              <p className={`${styles.summary} legible`}>{project.summary}</p>
              {project.disclaimer ? <p className={styles.disclaimer}>{workCopy.samplesNote}</p> : null}
              <div className={styles.actions}>
                <CaseStudyButton slug={project.slug} label={`${workCopy.openCaseStudy}: ${project.title}`}>
                  {workCopy.openCaseStudy}
                </CaseStudyButton>
                {project.url ? (
                  <Button variant="quiet" href={project.url} external icon={<ArrowUpRight size={16} />}>
                    {workCopy.visitSite}
                  </Button>
                ) : null}
              </div>
            </div>

            {/* Shown when the 3D stage isn't running (no WebGL / still loading). */}
            <figure className={styles.poster}>
              <Image
                src={project.media.poster.src}
                alt={project.media.poster.alt}
                width={project.media.poster.width}
                height={project.media.poster.height}
                sizes="(max-width: 720px) 92vw, 50vw"
              />
            </figure>

            {/* Clicking the project's 3D screen opens the case study too (mouse convenience). */}
            <CaseStudyButton slug={project.slug} hitArea className={styles.screenHit}>
              <span className="sr-only">{`${workCopy.openCaseStudy}: ${project.title}`}</span>
            </CaseStudyButton>
          </article>
        ))}
      </Beats>

      <StepNav
        chapter="work"
        label="Projects"
        className={styles.index}
        steps={orderedProjects.map((p, i) => ({
          id: p.slug,
          label: p.title,
          meta: kindLabel(p),
          range: [...t.projects[i]] as [number, number],
        }))}
      />
    </Chapter>
  );
}
