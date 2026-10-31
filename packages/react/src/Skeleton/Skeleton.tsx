import type { CSSProperties } from "react";
import { cx } from "../internal/cx.js";
import { useSeed } from "../internal/useSeed.js";
import { seed as seeded, type Seed } from "../seed.js";
import styles from "./Skeleton.module.css";

export type SkeletonShape = "line" | "title" | "circle" | "block" | "pill";

export interface SkeletonProps {
  /** `line` for a line of text (default), `title` for a heading, `circle` for an avatar, `block` for an image or card, `pill` for a tag. */
  shape?: SkeletonShape;
  /** Width as a number of px or any CSS length. Defaults to the shape's usual size. */
  width?: number | string;
  /** Height as a number of px or any CSS length. Defaults to the shape's usual size. */
  height?: number | string;
  /** Sweep a pencil-hatch shimmer across it. Off under reduced motion. Default true. */
  animated?: boolean;
  /** Seeds the hand-cut corners and tilt. Defaults to a stable per-instance id. */
  seed?: Seed;
  /** Extra class on the scrap. */
  className?: string;
  /** Inline styles on the scrap. */
  style?: CSSProperties;
}

const len = (v: number | string | undefined) => (typeof v === "number" ? `${v}px` : v);

/** Hand-cut corners: every scrap is snipped a little differently, scaled by `--plop-roundness`. */
function corners(rnd: () => number, base: number) {
  const c = () => `calc(${Math.round(base * (0.7 + rnd() * 0.6))}px * var(--plop-roundness, 1))`;
  return `${c()} ${c()} ${c()} ${c()} / ${c()} ${c()} ${c()} ${c()}`;
}

/**
 * A paper scrap that holds the place of something still loading, shaped like the real thing so nothing jumps
 * when it arrives. Decorative (`aria-hidden`): put `aria-busy="true"` on the region that's loading instead.
 */
export function Skeleton({ shape = "line", width, height, animated = true, seed, className, style }: SkeletonProps) {
  const s = useSeed(seed);
  const rnd = seeded(`${s}:sk`);
  const radius = shape === "circle" ? "50% 46% 53% 48%" : corners(rnd, shape === "block" ? 14 : 7);
  const tilt = shape === "pill" ? `${Math.round((rnd() * 2 - 1) * 30) / 10}deg` : undefined;
  return (
    <span
      className={cx(styles.root, styles[shape], animated && styles.animated, className)}
      aria-hidden="true"
      style={{ width: len(width), height: len(height), borderRadius: radius, rotate: tilt, ...style }}
    >
      {animated && <span className={styles.hatch} />}
    </span>
  );
}

export interface SkeletonTextProps {
  /** How many lines. Default 3. */
  lines?: number;
  /** Seeds the line lengths. Defaults to a stable per-instance id. */
  seed?: Seed;
  /** Sweep the shimmer. Default true. */
  animated?: boolean;
  /** Extra class on the wrapper. */
  className?: string;
}

/** A paragraph's worth of skeleton lines, each a different length, the last one short. Decorative. */
export function SkeletonText({ lines = 3, seed, animated = true, className }: SkeletonTextProps) {
  const s = useSeed(seed);
  const rnd = seeded(`${s}:lines`);
  return (
    <span className={cx(styles.text, className)} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => {
        const w = i === lines - 1 && lines > 1 ? 38 + rnd() * 24 : 82 + rnd() * 18;
        return <Skeleton key={i} shape="line" width={`${Math.round(w)}%`} seed={`${s}:${i}`} animated={animated} />;
      })}
    </span>
  );
}
