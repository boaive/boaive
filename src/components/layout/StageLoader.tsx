import styles from "./StageLoader.module.css";

/**
 * A quiet note while the 3D stage downloads (html[data-stage="loading"]). The story is
 * already readable underneath, so this is visual only and never blocks anything.
 */
export function StageLoader() {
  return (
    <p className={`${styles.loader} mono`} aria-hidden="true">
      <span className={styles.line} />
      Loading the 3D story
    </p>
  );
}
