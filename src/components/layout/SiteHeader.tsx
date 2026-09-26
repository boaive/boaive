"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { primaryNav, site } from "@/content/site";
import { goToChapter } from "@/lib/navigation";
import { introMessage, whatsappHref } from "@/lib/whatsapp";
import { useStory } from "@/story/store";
import { Logo } from "@/components/brand/Logo";
import { ContactLinks } from "@/components/contact/ContactLinks";
import { Button } from "@/components/ui/Button";
import { ChapterLink } from "@/components/ui/ChapterLink";
import { ArrowUpRight, CloseIcon, MenuIcon } from "@/components/ui/icons";
import { SoundToggle } from "./SoundToggle";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const active = useStory("active");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    if (menuOpen && !menu.open) menu.showModal();
    if (!menuOpen && menu.open) menu.close();
  }, [menuOpen]);

  return (
    <header className={styles.header}>
      <Link
        href="/"
        className={styles.brand}
        aria-label={`${site.name} — back to the start`}
        onClick={(e) => {
          if (!onHome) return;
          e.preventDefault();
          void goToChapter("float");
        }}
      >
        <Logo />
      </Link>

      <nav aria-label="Primary" className={styles.nav}>
        <ul role="list">
          {primaryNav.map((item) => {
            const current = onHome && active === item.chapter;
            return (
              <li key={item.chapter}>
                <ChapterLink chapter={item.chapter} className={styles.navLink} current={current}>
                  {item.label}
                </ChapterLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.actions}>
        <span className={styles.sound}>
          <SoundToggle />
        </span>
        <Button href={whatsappHref(introMessage())} external size="sm" icon={<ArrowUpRight size={15} />} className={styles.cta}>
          Let&apos;s build
        </Button>
        <button
          type="button"
          className={styles.menuButton}
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <MenuIcon size={22} />
          <span className="sr-only">Open menu</span>
        </button>
      </div>

      <dialog ref={menuRef} className={styles.menu} aria-label="Menu" onClose={() => setMenuOpen(false)}>
        <div className={styles.menuInner}>
          <div className={styles.menuBar}>
            <Logo />
            <button type="button" className={styles.menuClose} onClick={() => setMenuOpen(false)}>
              <CloseIcon size={22} />
              <span className="sr-only">Close menu</span>
            </button>
          </div>
          <nav aria-label="Menu">
            <ol role="list" className={styles.menuNav}>
              {primaryNav.map((item, i) => (
                <li key={item.chapter}>
                  <ChapterLink chapter={item.chapter} className={styles.menuLink} onNavigate={() => setMenuOpen(false)}>
                    <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                    {item.label}
                  </ChapterLink>
                </li>
              ))}
            </ol>
          </nav>
          <div className={styles.menuFoot}>
            <Button href={whatsappHref(introMessage())} external icon={<ArrowUpRight size={16} />}>
              Let&apos;s build on WhatsApp
            </Button>
            <ContactLinks whatsapp={false} layout="column" />
            <SoundToggle />
          </div>
        </div>
      </dialog>
    </header>
  );
}
