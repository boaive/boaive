import Link from "next/link";
import type { CSSProperties } from "react";
import { archiveCopy } from "@/content/home";
import { capabilities } from "@/data/capabilities";
import type { Project } from "@/data/types";
import { ArrowRight, ArrowUpRight } from "@/components/ui/icons";
import { KindBadge } from "./KindBadge";
import { ScreenPreview } from "./ScreenPreview";
import styles from "./ArchiveCard.module.css";

type Props = {
  project: Project;
  /** Position within its group (01, 02…). */
  index: number;
  /** A wide row for headline work, or a grid card. */
  layout: "feature" | "card";
  /** Mirror a feature row (screen on the right). */
  flip?: boolean;
  priority?: boolean;
};

const sizes = {
  feature: "(max-width: 900px) 100vw, 58vw",
  card: "(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw",
};

/**
 * One project in the /work archive. The whole card opens the case study (the title link
 * stretches over it); the live site is a separate link on top.
 */
export function ArchiveCard({ project, index, layout, flip = false, priority = false }: Props) {
  const capabilityNames = project.capabilities
    .map((id) => capabilities.find((c) => c.id === id)?.name)
    .filter((name): name is string => Boolean(name));
  const host = project.url ? new URL(project.url).host.replace(/^www\./, "") : null;

  return (
    <article
      className={styles.card}
      data-layout={layout}
      data-flip={flip ? "" : undefined}
      data-card=""
      aria-labelledby={`archive-${project.slug}`}
      style={{ "--project": project.accent } as CSSProperties}
    >
      <ScreenPreview project={project} sizes={sizes[layout]} priority={priority} />

      <div className={styles.body}>
        <p className={styles.meta}>
          <span className={`${styles.index} mono`}>{String(index + 1).padStart(2, "0")}</span>
          <KindBadge project={project} />
          {project.year ? <span className="mono">{project.year}</span> : null}
        </p>

        <h3 id={`archive-${project.slug}`} className={styles.title}>
          <Link href={`/work/${project.slug}`} className={styles.link}>
            {project.title}
          </Link>
        </h3>
        <p className={`${styles.type} mono`}>
          {project.type} · {project.industry}
        </p>
        <p className={styles.summary}>{project.summary}</p>

        {layout === "feature" ? (
          <ul role="list" className={styles.tags} aria-label="Capabilities and technology">
            {capabilityNames.map((name) => (
              <li key={name} data-capability="">
                {name}
              </li>
            ))}
            {project.technologies.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
        ) : null}

        <div className={styles.actions}>
          <span className={styles.caseStudy} aria-hidden="true">
            {archiveCopy.caseStudy}
            <ArrowRight size={16} />
          </span>
          {project.url && host ? (
            <a className={`${styles.live} mono`} href={project.url} target="_blank" rel="noopener noreferrer">
              {layout === "feature" ? (
                <>
                  <span className="sr-only">{archiveCopy.liveSite}: </span>
                  {host}
                </>
              ) : (
                archiveCopy.liveSite
              )}
              <ArrowUpRight size={13} />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
