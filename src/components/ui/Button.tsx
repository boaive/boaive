import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "quiet";
type Size = "md" | "sm" | "lg";

type Common = {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  /** Put the icon before the label instead of after. */
  iconFirst?: boolean;
  className?: string;
  children: ReactNode;
};

type AsLink = Common & { href: string; external?: boolean } & Omit<ComponentPropsWithoutRef<"a">, "href" | "className" | "children">;
type AsButton = Common & { href?: undefined } & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">;

export function Button(props: AsLink | AsButton) {
  const { variant = "primary", size = "md", icon, iconFirst, className, children, ...rest } = props;
  const cls = [styles.button, styles[variant], styles[size], className].filter(Boolean).join(" ");
  const content = (
    <>
      {iconFirst && icon ? <span className={styles.icon}>{icon}</span> : null}
      <span className={styles.label}>{children}</span>
      {!iconFirst && icon ? <span className={styles.icon}>{icon}</span> : null}
    </>
  );

  if ("href" in rest && typeof rest.href === "string") {
    const { href, external, ...anchor } = rest as AsLink;
    if (external || /^(https?:|mailto:|tel:|#)/.test(href)) {
      return (
        <a
          href={href}
          className={cls}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : null)}
          {...anchor}
        >
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} {...anchor}>
        {content}
      </Link>
    );
  }

  const { type = "button", ...button } = rest as AsButton;
  return (
    <button type={type} className={cls} {...button}>
      {content}
    </button>
  );
}
