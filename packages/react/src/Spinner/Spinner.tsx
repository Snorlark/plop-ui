import type { CSSProperties, ReactNode } from "react";
import { BuddyArt } from "../Buddy/Buddy.js";
import { DOODLE_PATHS, type DoodleTone } from "../Doodle/Doodle.js";
import { cx } from "../internal/cx.js";
import { useSeed } from "../internal/useSeed.js";
import { seed as seeded, type Seed } from "../seed.js";
import styles from "./Spinner.module.css";

export type SpinnerKind = "ink" | "dots" | "scribble" | "sticker" | "buddy";
export type SpinnerSize = "sm" | "md" | "lg";

const SIZES: Record<SpinnerSize, number> = { sm: 20, md: 32, lg: 52 };
/** The boil: the same line redrawn this many times, swapped like frames of a flipbook. */
const FRAMES = 3;

const r1 = (n: number) => Math.round(n * 10) / 10;

/** A smooth path through points (Catmull-Rom turned into cubic Béziers). */
function smooth(pts: Array<[number, number]>): string {
  let d = `M${r1(pts[0]![0])} ${r1(pts[0]![1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[i + 2] ?? p2;
    d += ` C ${r1(p1[0] + (p2[0] - p0[0]) / 6)} ${r1(p1[1] + (p2[1] - p0[1]) / 6)}, ${r1(p2[0] - (p3[0] - p1[0]) / 6)} ${r1(p2[1] - (p3[1] - p1[1]) / 6)}, ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return d;
}

/**
 * A marker circle drawn the way a hand draws one: it starts a little inside,
 * drifts out, and overshoots where it began. Never closes neatly.
 */
export function inkLoop(value: Seed): string {
  const rnd = seeded(value);
  const start = rnd() * Math.PI * 2;
  const steps = 10;
  const turn = Math.PI * 2 * 1.12;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = start + t * turn;
    const r = 16.6 + t * 2.4 + (rnd() - 0.5) * 2.2;
    pts.push([25 + Math.cos(a) * r, 25 + Math.sin(a) * r]);
  }
  return smooth(pts);
}

/** A run of cursive loops ("eee"), the line a pen makes while it thinks. */
export function scribbleLine(value: Seed): string {
  const rnd = seeded(value);
  const pts: Array<[number, number]> = [];
  const loops = 3;
  const n = loops * 14;
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * loops * Math.PI * 2;
    // A prolate cycloid: rolling forward slower than it turns makes the loops.
    pts.push([12 + 2.6 * t - 9 * Math.sin(t) + (rnd() - 0.5) * 1.2, 26 - 12 * Math.cos(t) + (rnd() - 0.5) * 1.2]);
  }
  return smooth(pts);
}

export interface SpinnerProps {
  /**
   * How it waits. `ink` (default) is a marker loop chasing itself; `dots` hop and
   * squash; `scribble` writes and erases a line of loops; `sticker` flips a
   * die-cut star like a coin; `buddy` is Hum, thinking it over. Default `ink`.
   */
  kind?: SpinnerKind;
  /** `sm` 20px, `md` 32px, `lg` 52px. Default `md`. */
  size?: SpinnerSize;
  /** What's loading, read out to screen readers. Default "Loading". */
  label?: string;
  /** Show the label next to the spinner instead of only reading it out. */
  showLabel?: boolean;
  /** The `sticker` kind's fill. The other kinds draw in the color around them. Default `mustard`. */
  tone?: DoodleTone;
  /** Wait this many milliseconds before showing it, so quick loads don't flicker. Default 0. */
  delay?: number;
  /** Seeds the wobble so a spinner looks the same on every render. Defaults to a stable per-instance id. */
  seed?: Seed;
  /** Extra class on the wrapper. */
  className?: string;
  /** Inline styles on the wrapper, e.g. a `color`. */
  style?: CSSProperties;
}

/** Just the drawing, decorative. Components that announce loading themselves (Button) use this. */
export function SpinnerMark({ kind = "ink", seed, tone = "mustard", className, style }: Pick<SpinnerProps, "kind" | "seed" | "tone" | "className" | "style">) {
  const s = useSeed(seed);
  const frames = Array.from({ length: FRAMES }, (_, i) => i);
  let art: ReactNode;

  if (kind === "dots") {
    const rnd = seeded(`${s}:dots`);
    art = (
      <span className={styles.hops}>
        {[0, 1, 2].map((i) => (
          <span key={i} className={styles.dot} style={{ "--i": i, "--d": (0.92 + rnd() * 0.22).toFixed(2) } as CSSProperties}>
            <i className={styles.blob} style={{ borderRadius: `${48 + Math.round(rnd() * 8)}% ${44 + Math.round(rnd() * 8)}% ${50 + Math.round(rnd() * 8)}% ${44 + Math.round(rnd() * 8)}%` }} />
            <i className={styles.ground} />
          </span>
        ))}
      </span>
    );
  } else if (kind === "scribble") {
    art = (
      <svg className={styles.pen} viewBox="0 0 80 50">
        {frames.map((f) => (
          <path key={f} className={styles.frame} d={scribbleLine(`${s}:${f}`)} pathLength={100} />
        ))}
      </svg>
    );
  } else if (kind === "sticker") {
    const d = DOODLE_PATHS.star;
    const face = (back: boolean) => (
      <svg className={cx(styles.face, back && styles.back)} viewBox="-10 -10 120 120">
        <path className={styles.cut} d={d} />
        <path className={styles.shape} d={d} style={back ? { fill: "var(--plop-paper-back)" } : undefined} />
        {!back && <path className={styles.shine} d="M34 42 C 38 36, 44 33, 50 32" />}
      </svg>
    );
    art = (
      <span className={styles.flip} style={{ "--fill": `var(--plop-${tone})`, "--tilt": `${r1((seeded(`${s}:tilt`)() * 2 - 1) * 9)}deg` } as CSSProperties}>
        <span className={styles.coin}>
          {face(false)}
          {face(true)}
        </span>
        <i className={styles.ground} />
      </span>
    );
  } else if (kind === "buddy") {
    art = (
      <span className={styles.hum}>
        <BuddyArt mood="thinking" />
      </span>
    );
  } else {
    art = (
      <svg className={styles.ring} viewBox="0 0 50 50">
        {frames.map((f) => {
          const d = inkLoop(`${s}:${f}`);
          return (
            <g key={f} className={styles.frame}>
              <path className={styles.track} d={d} />
              <path className={styles.arc} d={d} pathLength={100} />
            </g>
          );
        })}
      </svg>
    );
  }

  return (
    <span className={cx(styles.mark, styles[kind], className)} aria-hidden="true" style={style}>
      {art}
      <span className={styles.rest}>
        <i />
        <i />
        <i />
      </span>
    </span>
  );
}

/**
 * A hand-drawn loading spinner. The lines boil like a flipbook and take the
 * color around them, so it sits in a Button, a Card or on its own. Read out
 * once as `role="status"`. Under reduced motion it holds still and three
 * dots fade instead.
 */
export function Spinner({ kind = "ink", size = "md", label = "Loading", showLabel = false, tone, delay = 0, seed, className, style }: SpinnerProps) {
  return (
    <span
      role="status"
      className={cx(styles.root, delay > 0 && styles.delayed, className)}
      style={{ "--sp-size": `${SIZES[size]}px`, "--sp-delay": `${delay}ms`, ...style } as CSSProperties}
      data-size={size}
    >
      <SpinnerMark kind={kind} seed={seed} tone={tone} />
      <span className={showLabel ? styles.label : styles.vh}>{label}</span>
    </span>
  );
}
