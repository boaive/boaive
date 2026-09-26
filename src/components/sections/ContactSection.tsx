import { contactCopy } from "@/content/home";
import { beat, timing } from "@/story/timing";
import { Logo } from "@/components/brand/Logo";
import { ContactComposer } from "@/components/contact/ContactComposer";
import { ContactLinks } from "@/components/contact/ContactLinks";
import { Beats, Chapter } from "./Chapter";
import styles from "./ContactSection.module.css";

/** 09 — Surface. Back to the boat, now carrying a finished system. Let's build. */
export function ContactSection() {
  const t = timing.contact;
  return (
    <Chapter id="contact" stageClassName={styles.stage}>
      <Beats className={styles.beats}>
        <p className={`${styles.ascent} serif legible`} data-beat={beat(t.ascent)}>
          And back to the surface — with something that works.
        </p>

        <div className={styles.final} data-beat={beat(t.final)} data-fade="0.08">
          <div className={styles.brand}>
            <Logo className={styles.logo} />
            <p className={`${styles.tagline} serif`}>{contactCopy.tagline}</p>
          </div>

          <div className={styles.cta}>
            <h2 id="contact-title" className={`${styles.heading} t-display legible`} data-chapter-heading tabIndex={-1}>
              {contactCopy.heading}
            </h2>
            <p className={`${styles.body} legible`}>{contactCopy.body}</p>
          </div>

          <div className={styles.panel}>
            <ContactComposer />
            <div className={styles.other}>
              <p className={`${styles.otherLabel} mono`}>{contactCopy.otherWays}</p>
              <ContactLinks whatsapp={false} />
            </div>
          </div>
        </div>
      </Beats>
    </Chapter>
  );
}
