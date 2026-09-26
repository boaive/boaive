"use client";

import { scrollToChapterProgress } from "@/lib/navigation";
import type { ChapterId } from "@/story/chapters";

type Step = { id: string; label: string; range: [number, number]; meta?: string };

type Props = {
  chapter: ChapterId;
  steps: Step[];
  label: string;
  className?: string;
  itemClassName?: string;
  /** Show 01, 02… before each label. */
  numbered?: boolean;
};

/**
 * In-chapter index (capabilities, process, work). The ScrollDirector marks the active step
 * with aria-current; clicking scrolls the story to that step.
 */
export function StepNav({ chapter, steps, label, className, itemClassName, numbered = true }: Props) {
  return (
    <nav aria-label={label} className={className}>
      <ol role="list" data-steps="">
        {steps.map((step, i) => (
          <li key={step.id} data-step={step.range.join(",")} className={itemClassName}>
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
    </nav>
  );
}
