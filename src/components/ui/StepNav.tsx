"use client";

import type { ReactNode } from "react";
import { scrollToChapterProgress } from "@/lib/navigation";
import type { ChapterId } from "@/story/chapters";

type Step = {
  id: string;
  label: string;
  range: [number, number];
  meta?: string;
  /** First step of a new group (styled as a divider). */
  startsGroup?: boolean;
};

type Props = {
  chapter: ChapterId;
  steps: Step[];
  label: string;
  className?: string;
  itemClassName?: string;
  /** Show 01, 02… before each label. */
  numbered?: boolean;
  /** Rendered after the steps, inside the nav (e.g. a link out of the chapter). */
  after?: ReactNode;
};

/**
 * In-chapter index (capabilities, process, work). The ScrollDirector marks the active step
 * with aria-current; clicking scrolls the story to that step.
 */
export function StepNav({ chapter, steps, label, className, itemClassName, numbered = true, after }: Props) {
  return (
    <nav aria-label={label} className={className}>
      <ol role="list" data-steps="">
        {steps.map((step, i) => (
          <li
            key={step.id}
            data-step={step.range.join(",")}
            data-group-start={step.startsGroup ? "" : undefined}
            className={itemClassName}
          >
            <button
              type="button"
              onClick={() => scrollToChapterProgress(chapter, Math.min(step.range[1], step.range[0] + 0.035))}
            >
              {numbered ? <span className="mono" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span> : null}
              <span>{step.label}</span>
              {step.meta ? <span className="mono">{step.meta}</span> : null}
            </button>
          </li>
        ))}
      </ol>
      {after}
    </nav>
  );
}
