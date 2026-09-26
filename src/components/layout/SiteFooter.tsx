import { footerCopy } from "@/content/home";
import { primaryNav, site } from "@/content/site";
import { Logo } from "@/components/brand/Logo";
import { ContactLinks } from "@/components/contact/ContactLinks";
import { ChapterLink } from "@/components/ui/ChapterLink";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Logo />
          <p className={styles.line}>{footerCopy.line}</p>
        </div>
        <nav aria-label="Footer" className={styles.nav}>
          <ul role="list">
            {primaryNav.map((item) => (
              <li key={item.chapter}>
                <ChapterLink chapter={item.chapter}>{item.label}</ChapterLink>
              </li>
            ))}
          </ul>
        </nav>
        <ContactLinks layout="column" className={styles.contact} />
      </div>
      <div className={`${styles.base} mono`}>
        <span>
          © {year} {site.name}
        </span>
        <span>{site.tagline}</span>
      </div>
    </footer>
  );
}
