import { kindLabel } from "@/data/projects";
import type { Project } from "@/data/types";
import styles from "./KindBadge.module.css";

/** "Client work" vs "Experiment" / "Prototype" — the distinction is part of the site's honesty, so it's always visible. */
export function KindBadge({ project, className }: { project: Pick<Project, "kind">; className?: string }) {
  return (
    <span className={[styles.badge, className].filter(Boolean).join(" ")} data-kind={project.kind}>
      <span className={styles.dot} aria-hidden="true" />
      {kindLabel(project)}
    </span>
  );
}
