import Image from "next/image";
import Link from "next/link";
import { workCopy } from "@/content/home";
import { featuredProjects, isLabWork, kindLabel, orderedProjects, workGroups } from "@/data/projects";
import { beat, timing } from "@/story/timing";
import { Button } from "@/components/ui/Button";
import { StepNav } from "@/components/ui/StepNav";
import { ArrowRight, ArrowUpRight } from "@/components/ui/icons";
import { CaseStudyButton } from "@/components/work/CaseStudyButton";
import { KindBadge } from "@/components/work/KindBadge";
import { Beats, Chapter, ChapterLabel } from "./Chapter";
import styles from "./WorkSection.module.css";

const pad = (n: number) => String(n).padStart(2, "0");

const groupTitle = { client: workCopy.clientLabel, lab: workCopy.labLabel } as const;

/**
 * 06 — Work. The featured projects live as screens in the deep; each opens a case study.
 * The chapter closes by pulling back from the gallery toward the full archive (/work).
 */
export function WorkSection() {
  const t = timing.work;
  const total = pad(featuredProjects.length);
  const firstLab = featuredProjects.findIndex(isLabWork);
  const hasClient = featuredProjects.length > 0 && firstLab !== 0;

  return (
    <Chapter id="work" stageClassName={styles.stage}>
      <div className={styles.head}>
        <ChapterLabel id="work" />
        <div className={styles.group}>
          {hasClient ? (
            <p className="mono" data-beat={beat([t.projects[0][0], firstLab > 0 ? t.projects[firstLab][0] : t.more[0]])} data-dy="0">
              <span className="accent">●</span> {workCopy.clientLabel}
            </p>
          ) : null}
          {firstLab >= 0 ? (
            <p className="mono" data-beat={beat([t.projects[firstLab][0], t.more[0]])} data-dy="0">
              <span className={styles.labDot}>○</span> {workCopy.labLabel}
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

        {featuredProjects.map((project, i) => (
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
                  {pad(i + 1)} / {total}
                </span>
              </p>
              <h3 id={`project-${project.slug}`} className={`${styles.title} t-h2 legible`}>
                {project.title}
              </h3>
              <p className={`${styles.type} mono`}>
                {project.type} · {project.industry}
              </p>
              <p className={`${styles.summary} legible`}>{project.summary}</p>
              {project.disclaimer ? <p className={styles.disclaimer}>{workCopy.labNote}</p> : null}
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

        {/* The way out of the gallery: the full archive, in its two halves. */}
        <div className={styles.more} data-beat={beat(t.more)} data-fade="0.03">
          <div className={styles.moreText}>
            <p className={`${styles.moreEyebrow} mono`}>
              <span className="accent">◇</span> {workCopy.more.eyebrow} · {pad(orderedProjects.length)} projects
            </p>
            <h3 className={`${styles.moreHeading} t-h2 legible`}>{workCopy.more.heading}</h3>
            <p className={`${styles.moreBody} legible`}>{workCopy.more.body}</p>
            <ol role="list" className={styles.moreGroups}>
              {workGroups
                .filter((g) => g.projects.length)
                .map((g, i) => (
                  <li key={g.id}>
                    <Link href={`/work#${g.id}`}>
                      <span className="mono">{pad(i + 1)}</span>
                      <span className={styles.moreGroupTitle}>{groupTitle[g.id]}</span>
                      <span className={`${styles.moreCount} mono`}>{pad(g.projects.length)}</span>
                    </Link>
                  </li>
                ))}
            </ol>
            <Button href="/work" size="lg" icon={<ArrowRight size={18} />} className={styles.moreCta}>
              {workCopy.more.cta}
            </Button>
          </div>

          {/* Without the 3D stage: the featured screens as a small wall. */}
          <div className={styles.moreWall} aria-hidden="true">
            {featuredProjects.slice(0, 4).map((project) => (
              <Image
                key={project.slug}
                src={project.media.posterSmall.src}
                alt=""
                width={project.media.posterSmall.width}
                height={project.media.posterSmall.height}
                sizes="(max-width: 900px) 45vw, 22vw"
              />
            ))}
          </div>
        </div>
      </Beats>

      <StepNav
        chapter="work"
        label="Projects"
        className={styles.index}
        steps={featuredProjects.map((p, i) => ({
          id: p.slug,
          label: p.title,
          meta: kindLabel(p),
          range: [...t.projects[i]] as [number, number],
          startsGroup: i > 0 && i === firstLab,
        }))}
        after={
          <Link href="/work" className={styles.indexAll}>
            <span>{workCopy.allWork}</span>
            <span className="mono">{pad(orderedProjects.length)}</span>
            <ArrowRight size={14} />
          </Link>
        }
      />
    </Chapter>
  );
}
