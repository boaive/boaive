import Image from "next/image";
import { workCopy } from "@/content/home";
import { capabilities } from "@/data/capabilities";
import type { Project } from "@/data/types";
import { similarProjectMessage, whatsappHref } from "@/lib/whatsapp";
import { Button } from "@/components/ui/Button";
import { ArrowUpRight, WhatsAppIcon } from "@/components/ui/icons";
import { KindBadge } from "./KindBadge";
import { ProjectVideo } from "./ProjectVideo";
import styles from "./CaseStudy.module.css";

type Props = {
  project: Project;
  /** h1 on the standalone page, h2 inside the dialog. */
  headingLevel?: 1 | 2;
  headingId?: string;
};

/** Full case study. Used by the Work dialog and the /work/[slug] page. */
export function CaseStudy({ project, headingLevel = 2, headingId }: Props) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  const Sub = headingLevel === 1 ? "h2" : "h3";
  const capabilityNames = project.capabilities
    .map((id) => capabilities.find((c) => c.id === id)?.name)
    .filter(Boolean)
    .join(" · ");

  return (
    <article className={styles.study}>
      <header className={styles.header}>
        <div className={styles.badges}>
          <KindBadge project={project} />
          <span className="mono">{capabilityNames}</span>
        </div>
        <Heading id={headingId} className={`${styles.title} t-h1`}>
          {project.title}
        </Heading>
        <p className={styles.type}>
          {project.type} — {project.industry}
          {project.year ? ` · ${project.year}` : ""}
        </p>
        <p className={`${styles.summary} t-lede`}>{project.summary}</p>
        <div className={styles.actions}>
          {project.url ? (
            <Button href={project.url} external icon={<ArrowUpRight size={16} />}>
              {workCopy.visitSite}
            </Button>
          ) : null}
          <Button
            variant="secondary"
            href={whatsappHref(similarProjectMessage(project))}
            external
            icon={<WhatsAppIcon size={16} />}
            iconFirst
          >
            {workCopy.similar}
          </Button>
        </div>
        {project.disclaimer ? (
          <p className={styles.disclaimer} role="note">
            {workCopy.labNotice} {project.disclaimer}
          </p>
        ) : null}
      </header>

      {project.media.video ? (
        <ProjectVideo video={project.media.video} title={project.title} />
      ) : (
        <figure className={styles.video}>
          <Image
            src={project.media.poster.src}
            alt={project.media.poster.alt}
            width={project.media.poster.width}
            height={project.media.poster.height}
            sizes="(max-width: 900px) 100vw, 760px"
          />
        </figure>
      )}

      <div className={styles.body}>
        <section className={styles.block}>
          <Sub className={`${styles.blockTitle} mono`}>The problem</Sub>
          <p>{project.problem}</p>
        </section>
        <section className={styles.block}>
          <Sub className={`${styles.blockTitle} mono`}>The approach</Sub>
          <p>{project.approach}</p>
        </section>
        <section className={styles.block}>
          <Sub className={`${styles.blockTitle} mono`}>What we built</Sub>
          <ul role="list" className={styles.built}>
            {project.built.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section className={styles.block}>
          <Sub className={`${styles.blockTitle} mono`}>Technology</Sub>
          <ul role="list" className={styles.tags}>
            {project.technologies.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
        </section>
        {project.outcome ? (
          <section className={styles.block}>
            <Sub className={`${styles.blockTitle} mono`}>Result</Sub>
            <p>{project.outcome}</p>
          </section>
        ) : project.kind === "client" && project.url ? (
          <section className={styles.block}>
            <Sub className={`${styles.blockTitle} mono`}>Status</Sub>
            <p>
              Live at{" "}
              <a className={styles.inlineLink} href={project.url} target="_blank" rel="noopener noreferrer">
                {new URL(project.url).host}
              </a>
              .
            </p>
          </section>
        ) : null}
      </div>

      <section className={styles.gallery} aria-label={`${project.title} screens`}>
        <Sub className={`${styles.blockTitle} mono`}>Screens</Sub>
        <div className={styles.galleryGrid}>
          {project.media.gallery.map((img) => (
            <figure key={img.src} className={styles.shot}>
              <Image src={img.src} alt={img.alt} width={img.width} height={img.height} sizes="(max-width: 900px) 100vw, 720px" />
            </figure>
          ))}
        </div>
        {project.media.mobile.length ? (
          <div className={styles.phones}>
            {project.media.mobile.map((img) => (
              <figure key={img.src} className={styles.phone}>
                <Image src={img.src} alt={img.alt} width={img.width} height={img.height} sizes="(max-width: 900px) 45vw, 240px" />
              </figure>
            ))}
          </div>
        ) : null}
      </section>
    </article>
  );
}
