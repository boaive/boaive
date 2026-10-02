import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { contactCopy } from "@/content/home";
import { getProject, kindLabel, orderedProjects } from "@/data/projects";
import { breadcrumbs, creativeWork, graph } from "@/lib/schema";
import { introMessage, whatsappHref } from "@/lib/whatsapp";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { ArrowRight, ArrowUpRight } from "@/components/ui/icons";
import { CaseStudy } from "@/components/work/CaseStudy";
import { KindBadge } from "@/components/work/KindBadge";
import styles from "./page.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return orderedProjects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getProject(slug);
  if (!project) return {};
  const title = `${project.title} — ${project.type}`;
  return {
    title,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      type: "article",
      title: `${title} (${kindLabel(project)})`,
      description: project.summary,
      url: `/work/${project.slug}`,
      images: [
        {
          url: project.media.poster.src,
          width: project.media.poster.width,
          height: project.media.poster.height,
          alt: project.media.poster.alt,
        },
      ],
    },
    twitter: { card: "summary_large_image", title, description: project.summary, images: [project.media.poster.src] },
  };
}

export default async function WorkPage(props: PageProps<"/work/[slug]">) {
  const { slug } = await props.params;
  const project = getProject(slug);
  if (!project) notFound();

  const index = orderedProjects.findIndex((p) => p.slug === project.slug);
  const next = orderedProjects[(index + 1) % orderedProjects.length];

  return (
    <>
      <main id="main" className={styles.page}>
        <nav aria-label="Breadcrumb" className={`${styles.crumbs} mono`}>
          <Link href="/work">← All work</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{project.title}</span>
        </nav>

        <CaseStudy project={project} headingLevel={1} />

        <section className={styles.next} aria-label="Next project">
          <p className="mono">Next project</p>
          <Link href={`/work/${next.slug}`} className={styles.nextLink}>
            <span className="t-h2">{next.title}</span>
            <ArrowRight size={32} />
          </Link>
          <KindBadge project={next} />
        </section>

        <section className={styles.cta} aria-labelledby="work-cta-title">
          <h2 id="work-cta-title" className="t-h1">
            {contactCopy.heading}
          </h2>
          <p className="t-lede">{contactCopy.body}</p>
          <Button href={whatsappHref(introMessage())} external size="lg" icon={<ArrowUpRight size={18} />}>
            {contactCopy.whatsappCta}
          </Button>
        </section>
      </main>
      <SiteFooter />
      <JsonLd
        data={graph(
          creativeWork(project),
          breadcrumbs([
            { name: "Work", path: "/work" },
            { name: project.title, path: `/work/${project.slug}` },
          ]),
        )}
      />
    </>
  );
}
