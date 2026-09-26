import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 18, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function ArrowRight(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </Icon>
  );
}

export function ArrowUpRight(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 17 17 7M8 7h9v9" />
    </Icon>
  );
}

export function ArrowDown(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 4v15M6 13l6 6 6-6" />
    </Icon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Icon>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 9h16M4 15h10" />
    </Icon>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 19.5 5.6 16A8 8 0 1 1 8.4 18.7Z" />
      <path d="M9.2 9.1c.2-.6.5-.8.9-.8h.4c.2 0 .4.1.5.4l.6 1.4c.1.2 0 .5-.1.6l-.5.5c.5 1 1.3 1.8 2.3 2.3l.5-.5c.2-.2.4-.2.6-.1l1.4.6c.3.1.4.3.4.5v.4c0 .4-.2.7-.8.9-.9.3-2.6 0-4.3-1.6-1.6-1.6-2.1-3.5-1.9-4.6Z" />
    </Icon>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" />
      <path d="m4 7 8 6 8-6" />
    </Icon>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6.5 3.5h2.4l1.3 4-2 1.3a11 11 0 0 0 7 7l1.3-2 4 1.3v2.4a2 2 0 0 1-2.2 2A16 16 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z" />
    </Icon>
  );
}

/** Sound toggle glyph: waves when on, a flat line when off. */
/** Speaker for the icon-only sound toggle: waves when on, a cross when muted. */
export function SpeakerIcon({ on, ...props }: IconProps & { on: boolean }) {
  return (
    <Icon {...props}>
      <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" />
      {on ? (
        <>
          <path data-wave="1" d="M15.6 9.3a3.8 3.8 0 0 1 0 5.4" />
          <path data-wave="2" d="M18.3 6.7a7.5 7.5 0 0 1 0 10.6" />
        </>
      ) : (
        <path d="M16.2 9.8l4.4 4.4M20.6 9.8l-4.4 4.4" />
      )}
    </Icon>
  );
}

export function SoundIcon({ on, ...props }: IconProps & { on: boolean }) {
  return (
    <Icon {...props}>
      {on ? (
        <path d="M3 12h2l2-5 3 10 3-12 3 12 2-5h3" />
      ) : (
        <path d="M3 12h18" />
      )}
    </Icon>
  );
}
