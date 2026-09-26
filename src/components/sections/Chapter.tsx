import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { chapterNumber, getChapter, type ChapterId } from "@/story/chapters";
import styles from "./Chapter.module.css";

type ChapterProps = {
  id: ChapterId;
  children: ReactNode;
  /** Pinned stage (default) or normal flowing content. */
  pinned?: boolean;
  className?: string;
  stageClassName?: string;
};

/**
 * A story chapter: a tall section whose inner stage stays pinned while the chapter plays.
 * The scroll length comes from src/story/chapters.ts so pacing lives in one place.
 */
export function Chapter({ id, children, pinned = true, className, stageClassName }: ChapterProps) {
  const chapter = getChapter(id);
  const style = {
    "--len-d": chapter.length.desktop,
    "--len-m": chapter.length.mobile,
  } as CSSProperties;

  return (
    <section
      id={id}
      data-chapter={id}
      aria-labelledby={`${id}-title`}
      className={[styles.chapter, pinned ? styles.pinned : styles.flow, className].filter(Boolean).join(" ")}
      style={style}
    >
      {pinned ? <div className={[styles.stage, stageClassName].filter(Boolean).join(" ")}>{children}</div> : children}
    </section>
  );
}

/** Mono chapter label: "04 — What we build". */
export function ChapterLabel({
  id,
  children,
  className,
  ...rest
}: { id: ChapterId; children?: ReactNode; className?: string } & Omit<HTMLAttributes<HTMLParagraphElement>, "id">) {
  return (
    <p className={["mono", styles.label, className].filter(Boolean).join(" ")} {...rest}>
      <span className={styles.labelNumber}>{chapterNumber(id)}</span>
      <span aria-hidden="true" className={styles.labelRule} />
      <span>{children ?? getChapter(id).title}</span>
    </p>
  );
}

/** Stacks beats in one grid cell (with JS) so they can cross-fade in place. */
export function Beats({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={[styles.beats, className].filter(Boolean).join(" ")}>{children}</div>;
}
