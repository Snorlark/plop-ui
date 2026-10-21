import type { CSSProperties } from "react";
import { cx } from "../internal/cx.js";
import styles from "./Doodle.module.css";

export type DoodleKind = "star" | "heart" | "sparkle" | "burst";
export type DoodleTone = "tomato" | "mustard" | "mint" | "bubblegum" | "periwinkle" | "ink";

/** The marker shapes, each in a 100×100 box. */
export const DOODLE_PATHS: Record<DoodleKind, string> = {
  star: "M50 8 L 61 36 L 92 38 L 68 57 L 77 88 L 50 70 L 23 88 L 32 57 L 8 38 L 39 36 Z",
  heart: "M50 86 C 22 68, 6 50, 10 31 C 14 14, 38 10, 50 30 C 62 10, 86 14, 90 31 C 94 50, 78 68, 50 86 Z",
  sparkle: "M50 6 C 54 34, 66 46, 94 50 C 66 54, 54 66, 50 94 C 46 66, 34 54, 6 50 C 34 46, 46 34, 50 6 Z",
  burst: "M50 4 L 58 30 L 84 16 L 72 42 L 96 50 L 72 58 L 84 84 L 58 70 L 50 96 L 42 70 L 16 84 L 28 58 L 4 50 L 28 42 L 16 16 L 42 30 Z",
};

export interface DoodleProps {
  kind: DoodleKind;
  /** Fill color. Default `tomato`. */
  tone?: DoodleTone;
  /** Width and height in px. Default 48. */
  size?: number;
  /** Rotation in degrees. Default 0. */
  tilt?: number;
  className?: string;
  style?: CSSProperties;
}

/** A little die-cut marker doodle (star, heart, sparkle, burst) to decorate lettering and empty states. Decorative. */
export function Doodle({ kind, tone = "tomato", size = 48, tilt = 0, className, style }: DoodleProps) {
  const d = DOODLE_PATHS[kind];
  return (
    <svg
      className={cx(styles.root, className)}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
      style={{ "--dd-fill": `var(--plop-${tone})`, transform: tilt ? `rotate(${tilt}deg)` : undefined, ...style } as CSSProperties}
    >
      <path className={styles.cut} d={d} />
      <path className={styles.shape} d={d} />
    </svg>
  );
}
