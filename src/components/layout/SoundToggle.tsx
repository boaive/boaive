"use client";

import { setStory, useStory } from "@/story/store";
import { SoundIcon } from "@/components/ui/icons";
import styles from "./SoundToggle.module.css";

/** Sound is always opt-in. The synth engine is only downloaded on first use. */
export function SoundToggle({ showLabel = true }: { showLabel?: boolean }) {
  const on = useStory("sound");

  const toggle = async () => {
    const { audio } = await import("@/lib/audio/engine");
    if (on) {
      audio.disable();
      setStory({ sound: false });
    } else {
      const ok = await audio.enable();
      setStory({ sound: ok });
    }
  };

  return (
    <button type="button" className={styles.toggle} aria-pressed={on} onClick={toggle}>
      <SoundIcon on={on} size={18} />
      <span className={showLabel ? "mono" : "sr-only"}>{on ? "Sound on" : "Sound off"}</span>
    </button>
  );
}
