import styles from "./JumpVeil.module.css";

/** Covers the stage during chapter jumps (see lib/navigation.ts). */
export function JumpVeil() {
  return <div id="jump-veil" className={styles.veil} data-state="out" aria-hidden="true" />;
}
