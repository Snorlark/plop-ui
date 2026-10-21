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

/* ---- Everyday icons: the ones every app needs, in the same marker line ---- */

/** Two overlapping sheets, slightly askew. */
export function CopyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path {...stroke} strokeWidth={2.6} d="M9.2 8.6 C 12.8 8.2, 16.4 8.3, 20.2 8.9 C 20.7 12.6, 20.6 16.6, 20.1 20.4 C 16.4 20.9, 12.8 20.8, 9.1 20.3 C 8.7 16.4, 8.7 12.5, 9.2 8.6 Z" />
      <path {...stroke} strokeWidth={2.6} d="M15.4 5.2 C 15.2 4.4, 14.8 3.9, 14 3.8 C 10.7 3.4, 7.3 3.5, 4.4 4 C 3.8 7.6, 3.7 11.3, 4.1 14.9 C 4.3 15.6, 4.9 15.9, 5.6 15.9" />
    </Icon>
  );
}

/** Two chain loops. */
export function LinkIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path {...stroke} d="M10.4 13.6 C 11.6 15, 13.6 15.1, 15 13.8 L 18.6 10.2 C 20 8.7, 19.9 6.5, 18.5 5.2 C 17.1 3.9, 15.1 3.9, 13.7 5.2 L 12.4 6.6" />
      <path {...stroke} d="M13.6 10.4 C 12.4 9, 10.4 8.9, 9 10.2 L 5.4 13.8 C 4 15.3, 4.1 17.5, 5.5 18.8 C 6.9 20.1, 8.9 20.1, 10.3 18.8 L 11.6 17.4" />
    </Icon>
  );
}

/** A wobbly magnifier. */
export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path {...stroke} d="M10.6 3.8 C 14.6 3.6, 17.4 6.4, 17.2 10.4 C 17 14.2, 14.2 16.9, 10.4 16.8 C 6.6 16.7, 3.9 14, 4 10.2 C 4.1 6.6, 6.8 3.9, 10.6 3.8 Z" />
      <path {...stroke} strokeWidth={3.2} d="M15.4 15.6 C 17.2 17.2, 18.8 18.8, 20.6 20.8" />
    </Icon>
  );
}

/** A down arrow with a little wobble in the shaft. */
export function ArrowDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path {...stroke} d="M12 3.6 C 11.6 8.6, 12.4 13.6, 12 19.4 M6.2 13.8 C 8.4 15.6, 10.2 17.4, 12 19.6 C 13.8 17.4, 15.6 15.6, 17.8 13.6" />
    </Icon>
  );
}

/** A right arrow with a little wobble in the shaft. */
export function ArrowRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path {...stroke} d="M3.6 12.2 C 8.6 11.6, 13.6 12.4, 19.4 12 M13.8 6.2 C 15.6 8.4, 17.4 10.2, 19.6 12 C 17.4 13.8, 15.6 15.6, 13.6 17.8" />
    </Icon>
  );
}

/** A box with an arrow leaving it: opens somewhere else. */
export function ExternalIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path {...stroke} d="M11 4.6 C 8.6 4.4, 6.4 4.5, 4.6 4.8 C 4.2 9.4, 4.3 14.6, 4.8 19.4 C 9.4 19.8, 14.6 19.7, 19.2 19.3 C 19.6 17.4, 19.6 15.2, 19.4 13" />
      <path {...stroke} d="M11.4 12.6 C 14.2 9.8, 17 7, 19.8 4.2 M14.4 4 C 16.2 4.2, 18.2 4.1, 20 4 C 20.1 5.8, 20 7.8, 19.8 9.6" />
    </Icon>
  );
}

/** Three uneven lines. */
export function MenuIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path {...stroke} d="M4 6.4 C 9.4 5.8, 14.6 6.6, 20 6 M4.2 12.2 C 9.6 11.8, 14.4 12.6, 19.6 12 M4 18 C 8.6 17.6, 12.4 18.4, 16.8 17.8" />
    </Icon>
  );
}

/** A phone with buzz marks. Pass `off` for the crossed-out version. */
export function HapticsIcon({ off = false, ...props }: IconProps & { off?: boolean }) {
  return (
    <Icon viewBox="2.5 2.5 19 19" {...props}>
      <path {...stroke} strokeWidth={2.6} d="M8.5 4.2 C 11 3.8, 13.5 3.9, 15.6 4.3 C 16.1 9, 16 15, 15.6 19.8 C 13.2 20.2, 10.8 20.1, 8.4 19.8 C 8 15, 8 9, 8.5 4.2 Z" />
      <path {...stroke} strokeWidth={2.2} d="M11 17 L 13 17" />
      {off ? (
        <path {...stroke} strokeWidth={2.6} d="M4 4 C 9.4 9.2, 14.6 14.6, 20 20" />
      ) : (
        <path {...stroke} strokeWidth={2.2} d="M4.6 8.5 C 3.6 10.5, 3.6 13.5, 4.6 15.5 M19.4 8.5 C 20.4 10.5, 20.4 13.5, 19.4 15.5" />
      )}
    </Icon>
  );
}

/** A speaker with sound waves. Pass `off` for the muted version. */
export function SoundIcon({ off = false, ...props }: IconProps & { off?: boolean }) {
  return (
    <Icon viewBox="2.5 2.5 19 19" {...props}>
      <path {...stroke} strokeWidth={2.6} d="M3.8 9.6 C 5 9.4, 6.4 9.4, 7.6 9.5 L 12.2 5.4 C 12.6 9.8, 12.6 14.4, 12.2 18.6 L 7.6 14.6 C 6.3 14.7, 5 14.6, 3.8 14.4 C 3.6 12.8, 3.6 11.2, 3.8 9.6 Z" />
      {off ? (
        <path {...stroke} strokeWidth={2.6} d="M15.5 9.5 L 20.5 14.5 M20.5 9.5 L 15.5 14.5" />
      ) : (
        <path {...stroke} strokeWidth={2.2} d="M15.6 9.4 C 16.6 10.9, 16.6 13.1, 15.6 14.6 M18.4 7 C 20.4 9.8, 20.4 14.2, 18.4 17" />
      )}
    </Icon>
  );
}

/** A sheet of paper with a folded corner and a couple of lines: the light, paper surface. */
export function PaperIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path {...stroke} strokeWidth={2.6} d="M6 3.6 C 9 3.3, 11.8 3.4, 14.4 3.6 L 18.6 7.8 C 18.9 11.8, 18.8 16.4, 18.4 20.4 C 14.4 20.8, 10 20.7, 6 20.4 C 5.6 14.8, 5.6 9.2, 6 3.6 Z" />
      <path {...stroke} strokeWidth={2.2} d="M14.2 3.8 C 14 5.4, 14.2 7, 14.4 8.2 C 15.8 8.2, 17.2 8.1, 18.4 7.9" />
      <path {...stroke} strokeWidth={2} d="M8.8 12.2 C 10.8 12, 13 12.3, 15.4 12 M8.8 16 C 10.4 15.8, 11.8 16.1, 13.2 15.9" />
    </Icon>
  );
}

/** A cutting mat with its grid and a craft knife across it: the dark, cutting-mat surface. */
export function CuttingMatIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path {...stroke} strokeWidth={2.6} d="M3.6 5.4 C 9.2 5, 14.8 5.1, 20.4 5.4 C 20.8 9.6, 20.7 14.2, 20.4 18.6 C 14.8 19, 9.2 18.9, 3.6 18.6 C 3.2 14.2, 3.3 9.6, 3.6 5.4 Z" />
      <path {...stroke} strokeWidth={1.4} d="M8.4 5.6 L 8.4 18.4 M13.2 5.6 L 13.2 18.4 M3.8 10.2 L 20.2 10.2 M3.8 14.4 L 20.2 14.4" opacity={0.55} />
      <path {...stroke} strokeWidth={2.4} d="M9.6 21.4 C 12.6 17.6, 15.8 13.8, 19 10.2 L 21.2 8.4 C 21.4 9.4, 21 10.6, 20.2 11.4" />
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
