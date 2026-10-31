import type { CSSProperties, ReactNode } from "react";
import { BuddyArt } from "../Buddy/Buddy.js";
import { DOODLE_PATHS, type DoodleTone } from "../Doodle/Doodle.js";
import { cx } from "../internal/cx.js";
import { useSeed } from "../internal/useSeed.js";
import { seed as seeded, type Seed } from "../seed.js";
import { InkArt, inkLoop, MarkFrame, r1, smooth } from "./ink.js";
import styles from "./Spinner.module.css";

export { inkLoop };

export type SpinnerKind = "ink" | "dots" | "scribble" | "sticker" | "buddy";
export type SpinnerSize = "sm" | "md" | "lg";

const SIZES: Record<SpinnerSize, number> = { sm: 20, md: 32, lg: 52 };

/** Points along a run of cursive loops ("eee"), the line a pen makes while it thinks. */
function scribblePoints(value: Seed): Array<[number, number]> {
  const rnd = seeded(value);
  const pts: Array<[number, number]> = [];
  const loops = 3;
  const n = loops * 14;
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * loops * Math.PI * 2;
    // A prolate cycloid: rolling forward slower than it turns makes the loops.
    pts.push([12 + 2.6 * t - 9 * Math.sin(t) + (rnd() - 0.5) * 1.2, 26 - 12 * Math.cos(t) + (rnd() - 0.5) * 1.2]);
  }
  return pts;
}

/** The whole scribble as one path. */
export function scribbleLine(value: Seed): string {
  return smooth(scribblePoints(value));
}

/** Frames of the scribble flipbook: the pen writes it stroke by stroke, holds, then it's rubbed out from the start. */
const WRITE = 12;
const HOLD = 3;
const ERASE = 6;
export const SCRIBBLE_FRAMES = WRITE + HOLD + ERASE;

/** One drawing per frame, each redrawn with its own wobble, like stop-motion on paper. `tip` is where the pen is. */
export function scribbleFrames(value: Seed): Array<{ d: string; tip?: [number, number] }> {
  const frames: Array<{ d: string; tip?: [number, number] }> = [];
  for (let f = 0; f < SCRIBBLE_FRAMES; f++) {
    const pts = scribblePoints(`${value}:${f % 3}`);
    const last = pts.length - 1;
    if (f < WRITE) {
      const end = Math.max(2, Math.round(((f + 1) / WRITE) * last));
      const part = pts.slice(0, end + 1);
      frames.push({ d: smooth(part), tip: part[part.length - 1] });
    } else if (f < WRITE + HOLD) {
      frames.push({ d: smooth(pts) });
    } else {
      const start = Math.round(((f - WRITE - HOLD + 1) / (ERASE + 1)) * last);
      frames.push({ d: smooth(pts.slice(start)) });
    }
  }
  return frames;
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
    // A flipbook: every frame is its own drawing on one strip, stepped through a window (one transform).
    art = (
      <span className={styles.pen}>
        <span className={styles.penStrip}>
          {scribbleFrames(s).map((fr, i) => (
            <svg key={i} viewBox="0 0 80 50">
              <path d={fr.d} />
              {fr.tip && <circle className={styles.tip} cx={fr.tip[0]} cy={fr.tip[1]} r={3.6} />}
            </svg>
          ))}
        </span>
      </span>
    );
  } else if (kind === "sticker") {
    const d = DOODLE_PATHS.star;
    const face = (back: boolean) => (
      <svg className={cx(styles.face, back && styles.back)} viewBox="-10 -10 120 120">
        <path className={styles.drop} d={d} transform="translate(4 6)" />
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
    art = <InkArt seed={s} />;
  }

  return (
    <MarkFrame kind={kind} className={className} style={style}>
      {art}
    </MarkFrame>
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
