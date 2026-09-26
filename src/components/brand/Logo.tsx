import Image from "next/image";
import styles from "./Logo.module.css";

type Props = {
  /** Wordmark colour: light on dark backgrounds (default), dark on light ones. */
  tone?: "light" | "dark";
  /** Show only the "b" mark. */
  markOnly?: boolean;
  className?: string;
};

/**
 * The supplied BOAIVE logo, unchanged: the rendered "b" mark + the wordmark
 * (traced from the original lockup, same letterforms and accents).
 */
export function Logo({ tone = "light", markOnly = false, className }: Props) {
  return (
    <span className={[styles.logo, className].filter(Boolean).join(" ")}>
      <Image className={styles.mark} src="/brand/mark-128.png" alt="" width={96} height={128} priority />
      {markOnly ? null : (
        <Image
          className={styles.wordmark}
          src={tone === "light" ? "/brand/wordmark.svg" : "/brand/wordmark-dark.svg"}
          alt=""
          width={700}
          height={102}
          unoptimized
          priority
        />
      )}
    </span>
  );
}

/** Large standalone wordmark for brand moments. */
export function Wordmark({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  return (
    <Image
      className={className}
      src={tone === "light" ? "/brand/wordmark.svg" : "/brand/wordmark-dark.svg"}
      alt="Boaive"
      width={700}
      height={102}
      unoptimized
    />
  );
}
