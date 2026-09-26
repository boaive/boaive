"use client";

import type { ReactNode } from "react";
import { setStory } from "@/story/store";
import buttonStyles from "@/components/ui/Button.module.css";
import { ArrowRight } from "@/components/ui/icons";

type Props = {
  slug: string;
  children: ReactNode;
  /** Accessible label override (e.g. includes the project name). */
  label?: string;
  /** Invisible click target over the project's 3D screen (mouse only; the real button is in the text). */
  hitArea?: boolean;
  className?: string;
};

export function openCaseStudy(slug: string) {
  setStory({ openProject: slug, focusedProject: slug });
}

export function CaseStudyButton({ slug, children, label, hitArea = false, className }: Props) {
  if (hitArea) {
    return (
      <button
        type="button"
        className={className}
        tabIndex={-1}
        aria-hidden="true"
        onClick={() => openCaseStudy(slug)}
        onPointerEnter={() => setStory({ focusedProject: slug })}
        onPointerLeave={() => setStory({ focusedProject: null })}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={[buttonStyles.button, buttonStyles.primary, buttonStyles.md, className].filter(Boolean).join(" ")}
      aria-label={label}
      aria-haspopup="dialog"
      onClick={() => openCaseStudy(slug)}
    >
      <span className={buttonStyles.label}>{children}</span>
      <span className={buttonStyles.icon}>
        <ArrowRight size={16} />
      </span>
    </button>
  );
}
