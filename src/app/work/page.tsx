import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { archiveCopy, contactCopy, workCopy } from "@/content/home";
import { orderedProjects, workGroups, type WorkGroupId } from "@/data/projects";
import { introMessage, whatsappHref } from "@/lib/whatsapp";
import { ContactLinks } from "@/components/contact/ContactLinks";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui/Button";
import { ChapterLink } from "@/components/ui/ChapterLink";
import { WhatsAppIcon } from "@/components/ui/icons";
import { ArchiveCard } from "@/components/work/ArchiveCard";
import { ArchiveGauge } from "@/components/work/ArchiveGauge";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: archiveCopy.title,
  description: archiveCopy.description,
  alternates: { canonical: "/work" },
  openGraph: { title: `${archiveCopy.title} — Boaive`, description: archiveCopy.description, url: "/work" },
  twitter: { title: `${archiveCopy.title} — Boaive`, description: archiveCopy.description },
};

const pad = (n: number) => String(n).padStart(2, "0");
const plural = (n: number) => `${pad(n)} ${n === 1 ? "project" : "projects"}`;

/** Client work leads with wide rows (the first few); everything else sits in the grid. */
const FEATURE_ROWS = 2;

/** Drifting specks of light, placed deterministically so server and client agree. */
const specks = Array.from({ length: 26 }, (_, i) => {
  const r = (n: number) => {
    const x = Math.sin((i + 1) * 127.1 + n * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  return {
    left: `${(r(1) * 100).toFixed(2)}%`,
    top: `${(r(2) * 100).toFixed(2)}%`,
    size: `${(1 + r(3) * 2.2).toFixed(2)}px`,
    duration: `${(14 + r(4) * 16).toFixed(1)}s`,
    delay: `${(-r(5) * 20).toFixed(1)}s`,
    opacity: (0.25 + r(6) * 0.55).toFixed(2),
  };
});

export default function WorkIndexPage() {
  const groups = workGroups.filter((g) => g.projects.length);
  const gaugeSections = [
    { id: "archive-top", label: "The archive" },
    ...groups.map((g) => ({ id: g.id, label: archiveCopy.groups[g.id].title })),
    { id: "archive-contact", label: "Let's build" },
  ];

  return (
    <>
      <main id="main" className={styles.page}>
        <div className={styles.water} aria-hidden="true" />

        <header id="archive-top" className={styles.hero}>
          <div className={styles.heroDeep} aria-hidden="true">
            <span className={styles.shafts} />
            <span className={styles.floor} />
            {specks.map((s, i) => (
              <span
                key={i}
                className={styles.speck}
                style={
                  {
                    left: s.left,
                    top: s.top,
                    "--size": s.size,
                    "--dur": s.duration,
                    "--delay": s.delay,
                    "--o": s.opacity,
                  } as CSSProperties
                }
              />
            ))}
          </div>

          <nav aria-label="Breadcrumb" className={`${styles.crumbs} mono`}>
            <ChapterLink chapter="work">← Back to the story</ChapterLink>
          </nav>

          <p className={`${styles.eyebrow} mono`}>
            <span className="accent">◇</span> {workCopy.more.eyebrow} · {plural(orderedProjects.length)}
          </p>
          <h1 className={styles.title} tabIndex={-1}>
            {archiveCopy.heading}
          </h1>
          <p className={`${styles.lede} t-lede`}>{archiveCopy.lede}</p>

          <nav aria-label="Archive sections" className={styles.jump}>
            <ol role="list">
              {groups.map((g, i) => (
                <li key={g.id}>
                  <a href={`#${g.id}`}>
                    <span className={`${styles.jumpNumber} mono`}>{pad(i + 1)}</span>
                    <span className={styles.jumpTitle}>{archiveCopy.groups[g.id].title}</span>
                    <span className={`${styles.jumpCount} mono`}>{pad(g.projects.length)}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </header>

        {groups.map((group, gi) => (
          <ArchiveGroup key={group.id} id={group.id} number={gi + 1} projects={group.projects} />
        ))}

        <section id="archive-contact" className={styles.cta} aria-labelledby="archive-cta-title">
          <div data-reveal="">
            <p className={`${styles.ctaEyebrow} mono`}>
              <span className="accent">●</span> {contactCopy.heading}
            </p>
            <h2 id="archive-cta-title" className={`${styles.ctaTitle} t-h1`} tabIndex={-1}>
              {archiveCopy.cta.heading}
            </h2>
          </div>
          <div className={styles.ctaSide} data-reveal="" style={{ "--reveal-i": 1 } as CSSProperties}>
            <p className="t-lede">{archiveCopy.cta.body}</p>
            <Button href={whatsappHref(introMessage())} external size="lg" icon={<WhatsAppIcon size={18} />} iconFirst>
              {contactCopy.whatsappCta}
            </Button>
            <ContactLinks whatsapp={false} className={styles.ctaLinks} />
          </div>
        </section>

        <ArchiveGauge sections={gaugeSections} />
      </main>
      <SiteFooter />
    </>
  );
}

function ArchiveGroup({ id, number, projects }: { id: WorkGroupId; number: number; projects: typeof orderedProjects }) {
  const copy = archiveCopy.groups[id];
  const features = id === "client" ? projects.slice(0, FEATURE_ROWS) : [];
  const cards = projects.slice(features.length);

  return (
    <section id={id} className={styles.group} aria-labelledby={`${id}-title`} data-group={id}>
      <header className={styles.groupHead}>
        <p className={`${styles.groupLabel} mono`} data-reveal="">
          <span className={styles.groupNumber}>{pad(number)}</span>
          <span className={styles.groupRule} aria-hidden="true" />
          <span>{plural(projects.length)}</span>
        </p>
        <h2 id={`${id}-title`} className={styles.groupTitle} data-reveal="" tabIndex={-1}>
          {copy.title}
        </h2>
        <div className={styles.groupIntro} data-reveal="" style={{ "--reveal-i": 1 } as CSSProperties}>
          <p className="t-lede">{copy.intro}</p>
          {"note" in copy ? (
            <p className={styles.note} role="note">
              {copy.note}
            </p>
          ) : null}
        </div>
      </header>

      {features.length ? (
        <ol role="list" className={styles.features}>
          {features.map((project, i) => (
            <li key={project.slug} data-reveal="">
              <ArchiveCard project={project} index={i} layout="feature" flip={i % 2 === 1} priority={number === 1 && i === 0} />
            </li>
          ))}
        </ol>
      ) : null}

      {cards.length ? (
        <ol role="list" className={styles.grid}>
          {cards.map((project, i) => (
            <li key={project.slug} data-reveal="" style={{ "--reveal-i": i % 3 } as CSSProperties}>
              <ArchiveCard project={project} index={features.length + i} layout="card" />
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
