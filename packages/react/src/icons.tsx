import type { SVGProps } from "react";

/**
 * A few hand-drawn icons in the same marker stroke as the kit. They draw in
 * `currentColor`, so they take the label color of whatever they sit in.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function Icon({ size = 20, viewBox = "0 0 24 24", children, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox={viewBox} aria-hidden="true" focusable="false" {...rest}>
      {children}
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon viewBox="0 0 26 26" {...props}>
      <path {...stroke} strokeWidth={3.2} d="M13 4 C 12.5 10, 13.5 16, 13 22 M4 13.5 C 10 12.5, 16 13.5, 22 12.8" />
    </Icon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path {...stroke} strokeWidth={3} d="M5 5 C 10 10, 14 14, 19 19 M19 5 C 14 10, 10 14, 5 19" />
    </Icon>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path {...stroke} d="M12 21 C 7 15, 5 12, 5 9 C 5 5, 8 3, 12 3 C 16 3, 19 5.5, 19 9 C 19 12, 17 15, 12 21 Z" />
      <circle cx="12" cy="9" r="2.4" fill="currentColor" />
    </Icon>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        {...stroke}
        d="M6 3 L 9 3 L 10.5 7.5 L 8.5 9 C 9.5 11.5, 12.5 14.5, 15 15.5 L 16.5 13.5 L 21 15 L 21 18 C 21 19.5, 19.5 21, 18 21 C 10 20.5, 3.5 14, 3 6 C 3 4.5, 4.5 3, 6 3 Z"
      />
    </Icon>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        {...stroke}
        d="M6 17 C 6.5 14, 6 11, 6.5 9 C 7 5.5, 9.5 4, 12 4 C 14.5 4, 17 5.5, 17.5 9 C 18 11, 17.5 14, 18 17 Z M4 17.2 L 20 16.8 M10 20 C 11 21.2, 13 21.2, 14 20"
      />
    </Icon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path {...stroke} strokeWidth={3.2} d="M4 13 C 6.5 14.5, 8 17, 9 19.5 C 12 12, 15.5 7, 21 3.5" />
    </Icon>
  );
}

/* ---- Status icons: little round stickers with their own fill (callouts, toasts, hints) ---- */

const blob = "M16 3 C 24 3, 29 8, 29 16 C 29 24, 24 29, 16 29 C 8 29, 3 24, 3 16 C 3 8.5, 8 3, 16 3 Z";
const ink = "var(--plop-ink)";
const paper = "var(--plop-paper)";

export function InfoIcon(props: IconProps) {
  return (
    <Icon viewBox="0 0 32 32" size={28} {...props}>
      <path d={blob} fill={paper} stroke={ink} strokeWidth="2.6" />
      <circle cx="16" cy="10" r="2.2" fill={ink} />
      <path d="M14 15 L 16.5 14.5 L 16 23 M13.5 23.2 L 19 22.8" fill="none" stroke={ink} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function WarnIcon(props: IconProps) {
  return (
    <Icon viewBox="0 0 32 32" size={28} {...props}>
      <path d="M16 3.5 C 17 3.5, 29 26, 28.5 27.5 C 28 28.5, 4 28.5, 3.5 27.5 C 3 26, 15 3.5, 16 3.5 Z" fill={paper} stroke={ink} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M16 11 C 15.6 15, 16.3 17.5, 16 20" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" />
      <circle cx="16" cy="24" r="1.9" fill={ink} />
    </Icon>
  );
}

export function ErrorIcon(props: IconProps) {
  return (
    <Icon viewBox="0 0 32 32" size={28} {...props}>
      <path d={blob} fill="var(--plop-tomato)" stroke={ink} strokeWidth="2.6" />
      <path d="M16 8.5 C 15.6 13, 16.3 16, 16 19" fill="none" stroke={paper} strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="16" cy="23.5" r="2" fill={paper} />
    </Icon>
  );
}

export function SuccessIcon(props: IconProps) {
  return (
    <Icon viewBox="0 0 32 32" size={28} {...props}>
      <path d={blob} fill={paper} stroke={ink} strokeWidth="2.6" />
      <path d="M9 17 C 11 18.5, 12.5 20.5, 13.5 22.5 C 16 16, 19.5 11, 25 7" fill="none" stroke="var(--plop-leaf)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}
