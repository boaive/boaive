import { site } from "@/content/site";
import { introMessage, whatsappHref } from "@/lib/whatsapp";
import { InstagramIcon, MailIcon, PhoneIcon, WhatsAppIcon } from "@/components/ui/icons";
import styles from "./ContactLinks.module.css";

type Props = {
  /** Include WhatsApp (omit where a primary WhatsApp button is already shown). */
  whatsapp?: boolean;
  className?: string;
  layout?: "row" | "column";
};

/** Every way to reach Boaive, with the real handle/number visible (no hidden mystery links). */
export function ContactLinks({ whatsapp = true, className, layout = "row" }: Props) {
  const { contact } = site;
  const items = [
    whatsapp && {
      href: whatsappHref(introMessage()),
      label: "WhatsApp",
      value: contact.whatsapp.display,
      icon: <WhatsAppIcon size={18} />,
      external: true,
    },
    {
      href: contact.instagram.url,
      label: "Instagram",
      value: `@${contact.instagram.handle}`,
      icon: <InstagramIcon size={18} />,
      external: true,
    },
    { href: `mailto:${contact.email}`, label: "Email", value: contact.email, icon: <MailIcon size={18} />, external: false },
    { href: contact.phone.href, label: "Call", value: contact.phone.display, icon: <PhoneIcon size={18} />, external: false },
  ].filter(Boolean) as { href: string; label: string; value: string; icon: React.ReactNode; external: boolean }[];

  return (
    <ul role="list" className={[styles.list, styles[layout], className].filter(Boolean).join(" ")}>
      {items.map((item) => (
        <li key={item.label}>
          <a
            href={item.href}
            className={styles.link}
            {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : null)}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.text}>
              <span className="mono">{item.label}</span>
              <span className={styles.value}>{item.value}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
