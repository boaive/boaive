"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Scroll reveals for flowing content (the /work archive, the studio chapter): elements with
 * `data-reveal` rise in the first time they enter the viewport; `--reveal-i` staggers siblings.
 * Styles live in globals.css. Pinned story chapters use `data-beat` instead (ScrollDirector).
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])")];
    if (!els.length) return;
    if (typeof IntersectionObserver === "undefined") {
      els.forEach((el) => (el.dataset.revealed = ""));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealed = "";
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
