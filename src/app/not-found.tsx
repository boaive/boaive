import type { Metadata } from "next";
import { introMessage, whatsappHref } from "@/lib/whatsapp";
import { Backdrop } from "@/components/layout/Backdrop";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "@/components/ui/icons";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Page not found",
};

/** 404 — back on the surface at blue hour, the boat still on the horizon. */
export default function NotFound() {
  return (
    <>
      <Backdrop scene="night" />
      <main id="main" className={styles.page}>
        <p className={`${styles.eyebrow} mono`}>
          <span className="accent">404</span>
          <span className={styles.rule} aria-hidden="true" />
          Off the chart
        </p>
        <h1 className={`${styles.title} t-h1`}>This page drifted off.</h1>
        <p className={`${styles.lede} t-lede`}>
          The link may be old, or the page has moved. The boat&apos;s still here — here&apos;s the way back.
        </p>
        <div className={styles.actions}>
          <Button href="/" icon={<ArrowRight size={16} />}>
            Back to the story
          </Button>
          <Button href="/work" variant="secondary">
            See all work
          </Button>
        </div>
        <p className={styles.help}>
          Looking for something specific?{" "}
          <a href={whatsappHref(introMessage())} target="_blank" rel="noopener noreferrer">
            Ask us on WhatsApp
          </a>
          .
        </p>
      </main>
    </>
  );
}
