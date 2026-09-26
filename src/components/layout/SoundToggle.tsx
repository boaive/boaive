"use client";

import { setStory, useStory } from "@/story/store";
import { SoundIcon, SpeakerIcon } from "@/components/ui/icons";
import styles from "./SoundToggle.module.css";

type Props = {
  /** "label": waveform + "Sound on/off" (wide header). "icon": a 44px speaker button (compact header, menu). */
  variant?: "label" | "icon";
};

/** Sound is always opt-in. The synth engine is only downloaded on first use. */
export function SoundToggle({ variant = "label" }: Props) {
  const on = useStory("sound");
  const iconOnly = variant === "icon";
  const label = on ? "Sound on" : "Sound off";

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
    <button
      type="button"
      className={iconOnly ? `${styles.toggle} ${styles.icon}` : styles.toggle}
      aria-pressed={on}
      title={iconOnly ? label : undefined}
      onClick={toggle}
    >
      {iconOnly ? <SpeakerIcon on={on} size={21} /> : <SoundIcon on={on} size={18} />}
      <span className={iconOnly ? "sr-only" : "mono"}>{label}</span>
    </button>
  );
}
