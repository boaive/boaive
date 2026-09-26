"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { goToChapter } from "@/lib/navigation";
import type { ChapterId } from "@/story/chapters";
import buttonStyles from "./Button.module.css";

type Props = {
  chapter: ChapterId;
  children: ReactNode;
  /** Render with button styles. */
  variant?: "primary" | "secondary" | "quiet";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  className?: string;
  onNavigate?: () => void;
  /** Marks the link as the reader's current location in the story. */
  current?: boolean;
};

/** Link to a story chapter: veil-jumps on the home page, navigates to /#chapter elsewhere. */
export function ChapterLink({ chapter, children, variant, size = "md", icon, className, onNavigate, current }: Props) {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const cls = [variant ? buttonStyles.button : null, variant ? buttonStyles[variant] : null, variant ? buttonStyles[size] : null, className]
    .filter(Boolean)
    .join(" ");

  return (
    <a
      href={onHome ? `#${chapter}` : `/#${chapter}`}
      className={cls || undefined}
      aria-current={current ? "location" : undefined}
      onClick={(e) => {
        onNavigate?.();
        if (!onHome || e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        void goToChapter(chapter);
      }}
    >
      {variant ? <span className={buttonStyles.label}>{children}</span> : children}
      {icon ? <span className={buttonStyles.icon}>{icon}</span> : null}
    </a>
  );
}
