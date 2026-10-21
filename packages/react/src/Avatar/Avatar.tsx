import type { CSSProperties, ReactNode } from "react";
import { cx } from "../internal/cx.js";
import { hashString } from "../seed.js";
import styles from "./Avatar.module.css";

export type AvatarStatus = "online" | "busy" | "offline";

export interface AvatarProps {
  /** The person's name. Picks their doodle face and becomes the accessible name. */
  name: string;
  /** A photo URL; replaces the doodle. */
  src?: string;
  /** Face size: sm 36px, md 52px, lg 76px, xl 86px. Default `md`. */
  size?: "sm" | "md" | "lg" | "xl";
  /** A status dot. Its meaning is added to the accessible name ("Jun Reyes, online"). */
  status?: AvatarStatus;
  /** Words for the status, e.g. "on a call". Default: online / busy / offline. */
  statusLabel?: string;
  /** Rotation in degrees. Default 0. */
  tilt?: number;
  className?: string;
}

const INK = "var(--plop-ink)";
const PAPER = "var(--plop-paper)";
const mix = (c: string, pct: number) => `color-mix(in srgb, var(--plop-${c}) ${pct}%, var(--plop-paper))`;
const SPOTS = ["var(--plop-bubblegum)", "var(--plop-mustard)", "var(--plop-tomato)", "var(--plop-mint)", mix("periwinkle", 80)];
const BACKS = [mix("bubblegum", 35), mix("mustard", 30), mix("mint", 35), mix("periwinkle", 35), mix("tomato", 18)];

/** The doodle face for a name: same name, same face, on server and client. */
function Face({ name }: { name: string }) {
  const h = hashString(name);
  const spot = SPOTS[(h >>> 3) % SPOTS.length] as string;
  const top = (h >>> 11) % 6;
  const eyes = (h >>> 15) % 3;
  const mouth = (h >>> 18) % 3;
  const glasses = (h >>> 21) % 5 === 0;
  const blush = (h >>> 23) % 3 === 0;
  const line = { fill: "none", stroke: INK, strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  const twice = (d: string, fill: string) => (
    <>
      <path d={d} fill={fill} transform="translate(1.6 1.3)" />
      <path d={d} {...line} />
    </>
  );
  const tops = [
    <>
      {twice("M13 28 C 12 12, 44 8, 47 26 C 36 23, 24 24, 13 28 Z", spot)}
      <path d="M44 25 C 51 22, 58 24, 58 28 C 53 31, 47 31, 43 29 Z" {...line} fill={PAPER} />
    </>,
    <>
      {twice("M13 28 C 12 12, 44 8, 47 26 C 36 23, 24 24, 13 28 Z", spot)}
      <path d="M16 26 C 9 24, 3 26, 4 30 C 8 32, 13 31, 17 30 Z" {...line} fill={PAPER} />
    </>,
    <>
      {twice("M12 29 C 11 12, 47 10, 47 28 Z", spot)}
      <path d="M11 29 C 22 25, 37 25, 48 28" {...line} />
      <circle cx="29" cy="9" r="4" fill={PAPER} stroke={INK} strokeWidth="2.6" />
    </>,
    <>
      <path d="M13 27 C 14 17, 20 12, 26 13 C 28 8, 36 8, 38 13 C 44 13, 48 19, 47 26 C 40 22, 33 21, 28 23 C 22 21, 17 23, 13 27 Z" fill={INK} />
      <path d="M27 12 C 26 6, 31 4, 33 8" {...line} />
    </>,
    <>
      <path d="M13 28 C 13 16, 22 12, 30 12 C 39 12, 47 17, 47 27 C 40 24, 22 24, 13 28 Z" fill={INK} />
      <circle cx="31" cy="8" r="5.5" fill={INK} />
    </>,
    <path d="M11 40 C 8 22, 18 12, 30 12 C 43 12, 50 22, 48 38 C 46 30, 44 26, 42 24 C 36 27, 24 27, 16 24 C 14 28, 12 33, 11 40 Z" fill={INK} />,
  ];
  const blinkDelay = { "--blink-delay": `${-((h % 5000) / 1000)}s` } as CSSProperties;
  const eyeSets = [
    <g className={styles.blink} style={blinkDelay} key="a">
      <ellipse cx="28" cy="33" rx="2" ry="3.1" fill={INK} />
      <ellipse cx="38" cy="32" rx="2" ry="3.1" fill={INK} />
    </g>,
    <path key="b" d="M25.5 33 C 26.5 31, 29.5 31, 30.5 33 M35.5 32 C 36.5 30, 39.5 30, 40.5 32" {...line} strokeWidth={2.4} />,
    <g className={styles.blink} style={blinkDelay} key="c">
      <circle cx="28" cy="33" r="2.1" fill={INK} />
      <circle cx="38" cy="32" r="2.1" fill={INK} />
    </g>,
  ];
  const mouths = [
    <path key="a" d="M28 41 C 32 45, 38 44, 41 39" {...line} strokeWidth={2.5} />,
    <path key="b" d="M28.5 40 C 30 46, 38 46, 40 39 Z" fill="var(--plop-tomato)" stroke={INK} strokeWidth="2.3" strokeLinejoin="round" />,
    <ellipse key="c" cx="34" cy="42" rx="2" ry="2.5" fill={INK} />,
  ];
  return (
    <svg viewBox="2 2 56 56" aria-hidden="true">
      <path d="M30 15 C 42 15, 48 23, 47 34 C 46 45, 39 51, 29 51 C 19 51, 12 44, 12 33 C 12 22, 18 15, 30 15 Z" fill={PAPER} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M13 31 C 6 28, 5 40, 13 41" {...line} fill={PAPER} />
      <path d="M11 34 C 9 35, 9.5 37, 11.5 38" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      {blush && (
        <>
          <ellipse cx="23" cy="39" rx="3" ry="1.8" fill="var(--plop-bubblegum)" />
          <ellipse cx="43" cy="38" rx="2.4" ry="1.6" fill="var(--plop-bubblegum)" />
        </>
      )}
      {tops[top]}
      {eyeSets[eyes]}
      {mouths[mouth]}
      {glasses && (
        <g {...line} strokeWidth={2.2}>
          <circle cx="28" cy="33" r="5" />
          <circle cx="39" cy="32" r="5" />
          <path d="M33 32.5 L 34 32.3 M23 32 L 15 30" />
        </g>
      )}
    </svg>
  );
}

const STATUS_WORDS: Record<AvatarStatus, string> = { online: "online", busy: "busy", offline: "offline" };

/**
 * A doodle face generated from a name, so the same person always gets the
 * same face. Real photos can drop in with `src`.
 */
export function Avatar({ name, src, size = "md", status, statusLabel, tilt = 0, className }: AvatarProps) {
  const h = hashString(name);
  const label = status ? `${name}, ${statusLabel ?? STATUS_WORDS[status]}` : name;
  return (
    <span
      className={cx(styles.root, size !== "md" && styles[size], className)}
      style={{ "--ab": BACKS[(h >>> 7) % BACKS.length], "--tilt": `${tilt}deg` } as CSSProperties}
      role="img"
      aria-label={label}
    >
      {src ? <img className={styles.photo} src={src} alt="" /> : <Face name={name} />}
      {status && <span className={cx(styles.status, status !== "online" && styles[status])} aria-hidden="true" />}
    </span>
  );
}

export interface AvatarStackProps {
  /** Avatars to show (decorative inside the stack; the stack carries the name). */
  names: string[];
  /** How many faces to show before "+N". Default 3. */
  max?: number;
  /** Accessible name. Default "Rosa, Jun, Ana and 4 more". */
  label?: string;
  className?: string;
  children?: ReactNode;
}

/** Overlapping faces with a "+N" chip. */
export function AvatarStack({ names, max = 3, label, className }: AvatarStackProps) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  const firstNames = shown.map((n) => n.split(" ")[0]);
  const auto = rest > 0 ? `${firstNames.join(", ")} and ${rest} more` : firstNames.join(", ");
  return (
    <span className={cx(styles.stack, className)} role="img" aria-label={label ?? auto}>
      {shown.map((n) => (
        <span key={n} className={cx(styles.root, styles.sm)} style={{ "--ab": BACKS[(hashString(n) >>> 7) % BACKS.length] } as CSSProperties} aria-hidden="true">
          <Face name={n} />
        </span>
      ))}
      {rest > 0 && (
        <span className={styles.more} aria-hidden="true">
          +{rest}
        </span>
      )}
    </span>
  );
}
