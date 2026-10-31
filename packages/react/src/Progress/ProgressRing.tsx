import type { CSSProperties } from "react";
import { cx } from "../internal/cx.js";
import { useSeed } from "../internal/useSeed.js";
import { seed as seeded, type Seed } from "../seed.js";
import styles from "./ProgressRing.module.css";

const SIZES = { sm: 56, md: 88, lg: 120 } as const;
const r1 = (n: number) => Math.round(n * 10) / 10;

/** A closed, slightly lumpy circle that starts at twelve o'clock, so the fill begins at the top. */
export function wobblyCircle(value: Seed, radius = 40): string {
  const rnd = seeded(value);
  const n = 10;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    const r = radius + (rnd() - 0.5) * 3;
    return [50 + Math.cos(a) * r, 50 + Math.sin(a) * r] as const;
  });
  let d = `M${r1(pts[0]![0])} ${r1(pts[0]![1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]!;
    const p1 = pts[i]!;
    const p2 = pts[(i + 1) % n]!;
    const p3 = pts[(i + 2) % n]!;
    d += ` C ${r1(p1[0] + (p2[0] - p0[0]) / 6)} ${r1(p1[1] + (p2[1] - p0[1]) / 6)}, ${r1(p2[0] - (p3[0] - p1[0]) / 6)} ${r1(p2[1] - (p3[1] - p1[1]) / 6)}, ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return `${d} Z`;
}

export interface ProgressRingProps {
  /** What is progressing, read out to screen readers, e.g. "Uploading photos". */
  label: string;
  /** How far along, from 0 to `max`; values outside that range are clamped. */
  value: number;
  /** The value that means "done". Default 100. */
  max?: number;
  /** Read by screen readers and shown in the middle, e.g. "3 of 8". Default "<n>%". */
  valueText?: string;
  /** Hide the number in the middle (it's still read out). */
  hideValue?: boolean;
  /** `sm` 56px, `md` 88px, `lg` 120px. Default `md`. */
  size?: keyof typeof SIZES;
  /** Ink color of the fill: `mint` for good news, `tomato` for running out. Default `ink`. */
  tone?: "ink" | "mint" | "tomato";
  /** Seeds the wobble of the circle. Defaults to a stable per-instance id. */
  seed?: Seed;
  /** Extra class on the ring. */
  className?: string;
}

/**
 * A circular progress meter drawn in marker: the fill traces a lumpy hand-drawn circle from the top, and a
 * tick lands in the middle when it's done. `role="progressbar"`. Use a Spinner when you don't know how far along it is.
 */
export function ProgressRing({ label, value, max = 100, valueText, hideValue = false, size = "md", tone = "ink", seed, className }: ProgressRingProps) {
  const s = useSeed(seed);
  const clamped = Math.min(Math.max(value, 0), max);
  const ratio = max > 0 ? clamped / max : 0;
  const pct = Math.round(ratio * 100);
  const text = valueText ?? `${pct}%`;
  const done = ratio >= 1;
  const d = wobblyCircle(s);
  return (
    <div
      className={cx(styles.root, styles[tone], done && styles.done, className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={clamped}
      aria-valuetext={text}
      style={{ "--rs": `${SIZES[size]}px` } as CSSProperties}
      data-size={size}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <path className={styles.track} d={wobblyCircle(`${s}:track`, 40)} />
        <path className={styles.fill} d={d} pathLength={100} style={{ strokeDashoffset: 100 - pct }} />
        <path className={styles.tick} d="M33 52 C 38 56, 42 61, 45 67 C 52 54, 60 44, 70 36" pathLength={1} />
      </svg>
      {!hideValue && (
        <span className={styles.value} aria-hidden="true">
          {text}
        </span>
      )}
    </div>
  );
}
