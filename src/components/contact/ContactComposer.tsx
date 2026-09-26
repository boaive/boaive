"use client";

import { useId, useState } from "react";
import { contactCopy } from "@/content/home";
import { needTopics, topicMessage, whatsappHref, type NeedTopic } from "@/lib/whatsapp";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";
import styles from "./ContactComposer.module.css";

/**
 * Not a form: pick what you need, and WhatsApp opens with a clear, editable first message.
 */
export function ContactComposer() {
  const [topic, setTopic] = useState<NeedTopic>("website");
  const name = useId();

  return (
    <div className={styles.composer}>
      <fieldset className={styles.fieldset}>
        <legend className={`${styles.legend} mono`}>{contactCopy.composerLabel}</legend>
        <div className={styles.chips}>
          {needTopics.map((t) => (
            <label key={t.id} className={styles.chip}>
              <input
                type="radio"
                name={name}
                value={t.id}
                checked={topic === t.id}
                onChange={() => setTopic(t.id)}
              />
              <span>{t.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <Button
        href={whatsappHref(topicMessage(topic))}
        external
        size="lg"
        icon={<WhatsAppIcon size={20} />}
        iconFirst
        className={styles.cta}
      >
        {contactCopy.whatsappCta}
      </Button>
      <p className={styles.hint}>Opens WhatsApp with a short message you can edit before sending.</p>
    </div>
  );
}
