"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { featuredProjects, getProject } from "@/data/projects";
import { getLenis } from "@/lib/navigation";
import { setStory, useStory } from "@/story/store";
import { ArrowRight, CloseIcon } from "@/components/ui/icons";
import { CaseStudy } from "./CaseStudy";
import { KindBadge } from "./KindBadge";
import styles from "./ProjectDialog.module.css";

/**
 * Case study as a side sheet over the story. The native <dialog> gives focus trapping,
 * Escape to close and focus return; the 3D camera pushes in on the project's screen meanwhile.
 */
export function ProjectDialog() {
  const slug = useStory("openProject");
  const project = slug ? getProject(slug) : undefined;
  const ref = useRef<HTMLDialogElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (project) {
      if (!dialog.open) {
        dialog.showModal();
        getLenis()?.stop();
        document.documentElement.classList.add("dialog-open");
      }
      scrollRef.current?.scrollTo({ top: 0 });
    } else if (dialog.open) {
      dialog.close();
    }
  }, [project]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const onClose = () => {
      getLenis()?.start();
      document.documentElement.classList.remove("dialog-open");
      setStory({ openProject: null, focusedProject: null });
    };
    dialog.addEventListener("close", onClose);
    return () => {
      dialog.removeEventListener("close", onClose);
      // Leaving the page (e.g. "Open as page") unmounts the dialog without a close event.
      document.documentElement.classList.remove("dialog-open");
      setStory({ openProject: null, focusedProject: null });
    };
  }, []);

  // The dialog follows the screens in the story; the full list lives on /work.
  const index = project ? featuredProjects.findIndex((p) => p.slug === project.slug) : -1;
  const next = index >= 0 ? featuredProjects[(index + 1) % featuredProjects.length] : null;

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby="case-study-title"
      onClick={(e) => {
        if (e.target === ref.current) ref.current.close();
      }}
    >
      {project ? (
        <div className={styles.panel}>
          <div className={styles.bar}>
            <p className="mono">Case study · {String(index + 1).padStart(2, "0")}</p>
            <div className={styles.barActions}>
              <Link href="/work" className={`${styles.pageLink} mono`}>
                All work
              </Link>
              <Link href={`/work/${project.slug}`} className={`${styles.pageLink} mono`}>
                Open as page
              </Link>
              <button type="button" className={styles.close} onClick={() => ref.current?.close()} aria-label="Close case study">
                <CloseIcon size={20} />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className={styles.scroll} data-lenis-prevent>
            <CaseStudy project={project} headingId="case-study-title" />

            {next && next.slug !== project.slug ? (
              <button
                type="button"
                className={styles.next}
                onClick={() => setStory({ openProject: next.slug, focusedProject: next.slug })}
              >
                <span className="mono">Next project</span>
                <span className={styles.nextTitle}>
                  {next.title}
                  <ArrowRight size={22} />
                </span>
                <KindBadge project={next} />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
